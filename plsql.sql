-- =============================================================================
-- 03_plsql.sql  |  Blood Bank Management System  |  PL/SQL Backend
-- =============================================================================

-- =============================================================================
-- SECTION 1: USER-DEFINED TYPES
-- =============================================================================

-- User-defined record type for donor summary

CONNECT bloodbank/bloodbank123;
SHOW USER;
CREATE OR REPLACE TYPE donor_summary_rec AS OBJECT (
    donor_id    NUMBER,
    full_name   VARCHAR2(101),
    blood_group VARCHAR2(5),
    total_donations NUMBER
);
/

-- Nested table type
CREATE OR REPLACE TYPE donor_summary_tab AS TABLE OF donor_summary_rec;
/

-- =============================================================================
-- SECTION 2: STANDALONE FUNCTIONS
-- =============================================================================

-- Function 1: get_donor_total_donations
CREATE OR REPLACE FUNCTION get_donor_total_donations (
    p_donor_id IN NUMBER
) RETURN NUMBER IS
    v_total NUMBER := 0;
BEGIN
    SELECT COUNT(*)
      INTO v_total
      FROM donation
     WHERE donor_id = p_donor_id
       AND status   = 'Completed';
    RETURN v_total;
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN 0;
    WHEN OTHERS THEN RETURN -1;
END get_donor_total_donations;
/

-- Function 2: get_available_units
CREATE OR REPLACE FUNCTION get_available_units (
    p_bank_id       IN NUMBER,
    p_blood_type_id IN NUMBER
) RETURN NUMBER IS
    v_units NUMBER := 0;
BEGIN
    SELECT NVL(SUM(units), 0)
      INTO v_units
      FROM blood_inventory
     WHERE bank_id       = p_bank_id
       AND blood_type_id = p_blood_type_id
       AND expiry_date   > SYSDATE;
    RETURN v_units;
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN 0;
    WHEN OTHERS THEN RETURN -1;
END get_available_units;
/

-- Function 3: calculate_donor_age
CREATE OR REPLACE FUNCTION calculate_donor_age (
    p_donor_id IN NUMBER
) RETURN NUMBER IS
    v_dob  DATE;
    v_age  NUMBER;
BEGIN
    SELECT date_of_birth INTO v_dob
      FROM donor
     WHERE donor_id = p_donor_id;

    v_age := TRUNC(MONTHS_BETWEEN(SYSDATE, v_dob) / 12);
    RETURN v_age;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN -1;
    WHEN OTHERS THEN
        RETURN -1;
END calculate_donor_age;
/

-- =============================================================================
-- SECTION 3: STANDALONE STORED PROCEDURES
-- =============================================================================

-- Procedure 1: register_donor  (uses IN params, calls update_donor_eligibility)
CREATE OR REPLACE PROCEDURE register_donor (
    p_blood_type_id IN  NUMBER,
    p_first_name    IN  VARCHAR2,
    p_last_name     IN  VARCHAR2,
    p_gender        IN  VARCHAR2,
    p_dob           IN  DATE,
    p_phone         IN  VARCHAR2,
    p_email         IN  VARCHAR2,
    p_donor_id      OUT NUMBER
) IS
    e_invalid_age      EXCEPTION;
    e_invalid_gender   EXCEPTION;
    v_age              NUMBER;
BEGIN
    -- Validate gender
    IF p_gender NOT IN ('M', 'F') THEN
        RAISE e_invalid_gender;
    END IF;

    -- Validate age (must be 18–65)
    v_age := TRUNC(MONTHS_BETWEEN(SYSDATE, p_dob) / 12);
    IF v_age < 18 OR v_age > 65 THEN
        RAISE e_invalid_age;
    END IF;

    -- Insert donor
    SELECT seq_donor.NEXTVAL INTO p_donor_id FROM dual;

    INSERT INTO donor (
        donor_id, blood_type_id, first_name, last_name,
        gender, date_of_birth, phone, email, is_eligible
    ) VALUES (
        p_donor_id, p_blood_type_id, p_first_name, p_last_name,
        p_gender, p_dob, p_phone, p_email, 'Y'
    );

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Donor registered with ID: ' || p_donor_id);

EXCEPTION
    WHEN e_invalid_gender THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Gender must be M or F.');
        ROLLBACK;
    WHEN e_invalid_age THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Donor age must be between 18 and 65.');
        ROLLBACK;
    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Duplicate entry detected.');
        ROLLBACK;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR in register_donor: ' || SQLERRM);
        ROLLBACK;
END register_donor;
/

-- Procedure 2: process_blood_request  (IN OUT param, calls check_and_deduct_inventory)
CREATE OR REPLACE PROCEDURE check_and_deduct_inventory (
    p_bank_id       IN  NUMBER,
    p_blood_type_id IN  NUMBER,
    p_units_needed  IN  NUMBER,
    p_success       OUT VARCHAR2
) IS
    e_insufficient_stock EXCEPTION;
    v_available NUMBER;
BEGIN
    v_available := get_available_units(p_bank_id, p_blood_type_id);

    IF v_available < p_units_needed THEN
        RAISE e_insufficient_stock;
    END IF;

    -- Deduct from oldest non-expired inventory first
    UPDATE blood_inventory
       SET units = units - p_units_needed
     WHERE inventory_id = (
               SELECT inventory_id
                 FROM blood_inventory
                WHERE bank_id       = p_bank_id
                  AND blood_type_id = p_blood_type_id
                  AND expiry_date   > SYSDATE
                  AND units        >= p_units_needed
                ORDER BY expiry_date ASC
                FETCH FIRST 1 ROWS ONLY
           );

    p_success := 'Y';
    DBMS_OUTPUT.PUT_LINE('Inventory deducted: ' || p_units_needed || ' unit(s).');

EXCEPTION
    WHEN e_insufficient_stock THEN
        p_success := 'N';
        DBMS_OUTPUT.PUT_LINE('ERROR: Insufficient blood stock. Available: ' || v_available);
    WHEN OTHERS THEN
        p_success := 'N';
        DBMS_OUTPUT.PUT_LINE('ERROR in check_and_deduct_inventory: ' || SQLERRM);
END check_and_deduct_inventory;
/

CREATE OR REPLACE PROCEDURE process_blood_request (
    p_request_id IN OUT NUMBER,
    p_bank_id    IN     NUMBER
) IS
    e_request_not_found  EXCEPTION;
    e_already_processed  EXCEPTION;

    v_hospital_id   NUMBER;
    v_blood_type_id NUMBER;
    v_patient_id    NUMBER;
    v_units         NUMBER;
    v_status        VARCHAR2(20);
    v_success       VARCHAR2(1);
    v_trans_id      NUMBER;
BEGIN
    -- Fetch request details
    BEGIN
        SELECT hospital_id, blood_type_id, patient_id, units, status
          INTO v_hospital_id, v_blood_type_id, v_patient_id, v_units, v_status
          FROM blood_request
         WHERE request_id = p_request_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN RAISE e_request_not_found;
    END;

    -- Check not already fulfilled
    IF v_status = 'Fulfilled' THEN
        RAISE e_already_processed;
    END IF;

    -- Attempt inventory deduction (calls another procedure)
    check_and_deduct_inventory(p_bank_id, v_blood_type_id, v_units, v_success);

    IF v_success = 'Y' THEN
        -- Create transfusion record
        SELECT seq_transfusion.NEXTVAL INTO v_trans_id FROM dual;

        INSERT INTO transfusion (
            transfusion_id, bank_id, patient_id, request_id,
            transfusion_date, units, notes
        ) VALUES (
            v_trans_id, p_bank_id, v_patient_id, p_request_id,
            SYSDATE, v_units, 'Processed via process_blood_request'
        );

        -- Update request status
        UPDATE blood_request
           SET status = 'Fulfilled'
         WHERE request_id = p_request_id;

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Request ' || p_request_id || ' fulfilled. Transfusion ID: ' || v_trans_id);
    ELSE
        UPDATE blood_request
           SET status = 'Pending'
         WHERE request_id = p_request_id;
        COMMIT;
    END IF;

EXCEPTION
    WHEN e_request_not_found THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Blood request ID ' || p_request_id || ' not found.');
        ROLLBACK;
    WHEN e_already_processed THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Request ' || p_request_id || ' is already fulfilled.');
        ROLLBACK;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR in process_blood_request: ' || SQLERRM);
        ROLLBACK;
END process_blood_request;
/

-- Procedure 3: record_donation  (IN/OUT params, explicit cursor usage)
CREATE OR REPLACE PROCEDURE record_donation (
    p_donor_id      IN     NUMBER,
    p_blood_type_id IN     NUMBER,
    p_bank_id       IN     NUMBER,
    p_camp_id       IN     NUMBER,
    p_units         IN     NUMBER,
    p_donation_id   OUT    NUMBER,
    p_donor_eligible IN OUT VARCHAR2
) IS
    e_donor_not_eligible  EXCEPTION;
    e_invalid_units       EXCEPTION;

    v_eligible  VARCHAR2(1);
    v_age       NUMBER;
    v_last_date DATE;
    v_days_since NUMBER;

    -- Explicit cursor: recent donations by this donor
    CURSOR cur_recent_donations IS
        SELECT donation_date
          FROM donation
         WHERE donor_id = p_donor_id
           AND status   = 'Completed'
         ORDER BY donation_date DESC;

    cur_rec cur_recent_donations%ROWTYPE;
BEGIN
    -- Validate units
    IF p_units <= 0 OR p_units > 5 THEN
        RAISE e_invalid_units;
    END IF;

    -- Check donor eligibility flag
    SELECT is_eligible INTO v_eligible
      FROM donor
     WHERE donor_id = p_donor_id;

    IF v_eligible = 'N' THEN
        p_donor_eligible := 'N';
        RAISE e_donor_not_eligible;
    END IF;

    -- Check 56-day gap using explicit cursor
    OPEN cur_recent_donations;
    FETCH cur_recent_donations INTO cur_rec;
    IF cur_recent_donations%FOUND THEN
        v_days_since := SYSDATE - cur_rec.donation_date;
        IF v_days_since < 56 THEN
            CLOSE cur_recent_donations;
            p_donor_eligible := 'N';
            RAISE e_donor_not_eligible;
        END IF;
    END IF;
    CLOSE cur_recent_donations;

    -- Insert donation
    SELECT seq_donation.NEXTVAL INTO p_donation_id FROM dual;

    INSERT INTO donation (
        donation_id, donor_id, blood_type_id, bank_id, camp_id,
        donation_date, units, status
    ) VALUES (
        p_donation_id, p_donor_id, p_blood_type_id, p_bank_id, p_camp_id,
        SYSDATE, p_units, 'Completed'
    );

    -- Update inventory
    INSERT INTO blood_inventory (
        inventory_id, bank_id, blood_type_id, units,
        collection_date, expiry_date
    ) VALUES (
        seq_inventory.NEXTVAL, p_bank_id, p_blood_type_id, p_units,
        SYSDATE, SYSDATE + 42
    );

    p_donor_eligible := 'Y';
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Donation recorded. ID: ' || p_donation_id);

EXCEPTION
    WHEN e_invalid_units THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Units must be between 1 and 5.');
        ROLLBACK;
    WHEN e_donor_not_eligible THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Donor is not eligible for donation.');
        ROLLBACK;
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Donor ID ' || p_donor_id || ' not found.');
        ROLLBACK;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR in record_donation: ' || SQLERRM);
        ROLLBACK;
END record_donation;
/

-- =============================================================================
-- SECTION 4: PACKAGE  pkg_blood_bank
-- =============================================================================

CREATE OR REPLACE PACKAGE pkg_blood_bank AS
    -- Public types
    TYPE donor_info_rec IS RECORD (
        donor_id    NUMBER,
        full_name   VARCHAR2(101),
        blood_group VARCHAR2(5),
        is_eligible VARCHAR2(1)
    );

    -- Associative array type (string-indexed)
    TYPE blood_stock_arr IS TABLE OF NUMBER INDEX BY VARCHAR2(5);

    -- Procedures
    PROCEDURE update_donor_eligibility (
        p_donor_id  IN NUMBER,
        p_eligible  IN VARCHAR2
    );

    PROCEDURE generate_camp_report (
        p_camp_id   IN NUMBER,
        p_total_donors OUT NUMBER,
        p_total_units  OUT NUMBER
    );

    -- Function
    FUNCTION get_bank_stock_summary (
        p_bank_id IN NUMBER
    ) RETURN blood_stock_arr;

END pkg_blood_bank;
/

CREATE OR REPLACE PACKAGE BODY pkg_blood_bank AS

    -- Procedure: update_donor_eligibility
    PROCEDURE update_donor_eligibility (
        p_donor_id IN NUMBER,
        p_eligible IN VARCHAR2
    ) IS
        e_invalid_flag   EXCEPTION;
        v_count          NUMBER;
    BEGIN
        IF p_eligible NOT IN ('Y', 'N') THEN
            RAISE e_invalid_flag;
        END IF;

        SELECT COUNT(*) INTO v_count FROM donor WHERE donor_id = p_donor_id;
        IF v_count = 0 THEN
            RAISE NO_DATA_FOUND;
        END IF;

        UPDATE donor SET is_eligible = p_eligible WHERE donor_id = p_donor_id;
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Donor ' || p_donor_id || ' eligibility set to: ' || p_eligible);

    EXCEPTION
        WHEN e_invalid_flag THEN
            DBMS_OUTPUT.PUT_LINE('ERROR: Eligibility flag must be Y or N.');
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('ERROR: Donor ' || p_donor_id || ' not found.');
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('ERROR in update_donor_eligibility: ' || SQLERRM);
            ROLLBACK;
    END update_donor_eligibility;

    -- Procedure: generate_camp_report  (cursor FOR loop inside)
    PROCEDURE generate_camp_report (
        p_camp_id      IN  NUMBER,
        p_total_donors OUT NUMBER,
        p_total_units  OUT NUMBER
    ) IS
        e_camp_not_found EXCEPTION;
        v_count NUMBER;

        -- Nested table to store donation IDs for report
        TYPE donation_id_tab IS TABLE OF NUMBER;
        v_donations donation_id_tab := donation_id_tab();
    BEGIN
        SELECT COUNT(*) INTO v_count FROM camp WHERE camp_id = p_camp_id;
        IF v_count = 0 THEN RAISE e_camp_not_found; END IF;

        p_total_donors := 0;
        p_total_units  := 0;

        -- Cursor FOR loop: iterate all donations for this camp
        FOR don_rec IN (
            SELECT donor_id, units, donation_id
              FROM donation
             WHERE camp_id = p_camp_id
               AND status  = 'Completed'
        ) LOOP
            p_total_donors := p_total_donors + 1;
            p_total_units  := p_total_units  + don_rec.units;

            -- Extend and populate nested table
            v_donations.EXTEND;
            v_donations(v_donations.COUNT) := don_rec.donation_id;
        END LOOP;

        -- Demonstrate collection methods
        DBMS_OUTPUT.PUT_LINE('Camp ' || p_camp_id || ' Report:');
        DBMS_OUTPUT.PUT_LINE('  Total Donors : ' || p_total_donors);
        DBMS_OUTPUT.PUT_LINE('  Total Units  : ' || p_total_units);
        DBMS_OUTPUT.PUT_LINE('  Donation Count (nested table): ' || v_donations.COUNT);

        IF v_donations.COUNT > 0 THEN
            DBMS_OUTPUT.PUT_LINE('  First Donation ID: ' || v_donations(v_donations.FIRST));
            DBMS_OUTPUT.PUT_LINE('  Last  Donation ID: ' || v_donations(v_donations.LAST));
        END IF;

    EXCEPTION
        WHEN e_camp_not_found THEN
            DBMS_OUTPUT.PUT_LINE('ERROR: Camp ID ' || p_camp_id || ' not found.');
            p_total_donors := -1;
            p_total_units  := -1;
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('ERROR in generate_camp_report: ' || SQLERRM);
            p_total_donors := -1;
            p_total_units  := -1;
    END generate_camp_report;

    -- Function: get_bank_stock_summary  (returns associative array)
    FUNCTION get_bank_stock_summary (
        p_bank_id IN NUMBER
    ) RETURN blood_stock_arr IS
        v_stock blood_stock_arr;
        v_group VARCHAR2(5);
        v_units NUMBER;
    BEGIN
        -- Cursor FOR loop to populate associative array
        FOR inv_rec IN (
            SELECT bt.blood_group, NVL(SUM(bi.units), 0) AS total_units
              FROM blood_inventory bi
              JOIN blood_type bt ON bi.blood_type_id = bt.blood_type_id
             WHERE bi.bank_id     = p_bank_id
               AND bi.expiry_date > SYSDATE
             GROUP BY bt.blood_group
        ) LOOP
            v_stock(inv_rec.blood_group) := inv_rec.total_units;
        END LOOP;

        RETURN v_stock;

    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('ERROR in get_bank_stock_summary: ' || SQLERRM);
            RETURN v_stock;
    END get_bank_stock_summary;

END pkg_blood_bank;
/

-- =============================================================================
-- SECTION 5: TRIGGERS
-- =============================================================================

-- Trigger 1: BEFORE INSERT/UPDATE on blood_request (validation)
CREATE OR REPLACE TRIGGER trg_blood_request_before_insert
BEFORE INSERT OR UPDATE ON blood_request
FOR EACH ROW
DECLARE
    e_invalid_urgency   EXCEPTION;
    e_invalid_units     EXCEPTION;
    v_patient_blood     NUMBER;
    v_request_blood     NUMBER;
BEGIN
    -- Validate urgency level
    IF :NEW.urgency NOT IN ('Low', 'Medium', 'High', 'Critical') THEN
        RAISE e_invalid_urgency;
    END IF;

    -- Validate units
    IF :NEW.units IS NULL OR :NEW.units <= 0 THEN
        RAISE e_invalid_units;
    END IF;

    -- Default status on insert
    IF INSERTING AND :NEW.status IS NULL THEN
        :NEW.status := 'Pending';
    END IF;

    -- Default request date
    IF INSERTING AND :NEW.request_date IS NULL THEN
        :NEW.request_date := SYSDATE;
    END IF;

EXCEPTION
    WHEN e_invalid_urgency THEN
        RAISE_APPLICATION_ERROR(-20001,
            'Invalid urgency level. Must be: Low, Medium, High, or Critical.');
    WHEN e_invalid_units THEN
        RAISE_APPLICATION_ERROR(-20002,
            'Units requested must be a positive number.');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20003,
            'Blood request validation failed: ' || SQLERRM);
END trg_blood_request_before_insert;
/

-- Trigger 2: AFTER INSERT on donation (auditing — send notification)
CREATE OR REPLACE TRIGGER trg_donation_after_insert
AFTER INSERT ON donation
FOR EACH ROW
DECLARE
    v_notif_id  NUMBER;
    v_msg       VARCHAR2(500);
BEGIN
    -- Build a thank-you notification for the donor
    v_msg := 'Thank you for your donation on ' ||
             TO_CHAR(:NEW.donation_date, 'DD-Mon-YYYY') ||
             '. You donated ' || :NEW.units || ' unit(s). ' ||
             'Your contribution saves lives!';

    SELECT seq_notification.NEXTVAL INTO v_notif_id FROM dual;

    INSERT INTO notification (
        notification_id, donor_id, patient_id,
        message, sent_date, notif_type, is_read
    ) VALUES (
        v_notif_id, :NEW.donor_id, NULL,
        v_msg, SYSDATE, 'Donation', 'N'
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log but don't block the donation insert
        DBMS_OUTPUT.PUT_LINE('WARNING: Notification insert failed: ' || SQLERRM);
END trg_donation_after_insert;
/

-- Trigger 3: BEFORE INSERT on donor (validation)
CREATE OR REPLACE TRIGGER trg_donor_before_insert
BEFORE INSERT ON donor
FOR EACH ROW
DECLARE
    e_underage EXCEPTION;
    v_age      NUMBER;
BEGIN
    IF :NEW.date_of_birth IS NOT NULL THEN
        v_age := TRUNC(MONTHS_BETWEEN(SYSDATE, :NEW.date_of_birth) / 12);
        IF v_age < 18 THEN
            RAISE e_underage;
        END IF;
    END IF;

    -- Default eligibility
    IF :NEW.is_eligible IS NULL THEN
        :NEW.is_eligible := 'Y';
    END IF;

EXCEPTION
    WHEN e_underage THEN
        RAISE_APPLICATION_ERROR(-20010,
            'Donor must be at least 18 years old.');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20011,
            'Donor validation failed: ' || SQLERRM);
END trg_donor_before_insert;
/

-- =============================================================================
-- SECTION 6: ADVANCED PL/SQL BLOCK — Cursors, Records, Collections Demo
-- (Standalone procedure wrapping all collection/cursor requirements)
-- =============================================================================

CREATE OR REPLACE PROCEDURE generate_inventory_report (
    p_bank_id IN NUMBER
) IS
    -- User-defined record type
    TYPE inventory_summary_rec IS RECORD (
        blood_group    VARCHAR2(5),
        total_units    NUMBER,
        expiry_count   NUMBER
    );

    -- %ROWTYPE record
    v_bank_row  blood_bank%ROWTYPE;

    -- Associative array: blood group -> units
    TYPE units_by_group_arr IS TABLE OF NUMBER INDEX BY VARCHAR2(5);
    v_units_arr units_by_group_arr;

    -- Nested table of inventory_summary_rec
    TYPE inv_summary_tab IS TABLE OF inventory_summary_rec;
    v_summary_tab inv_summary_tab := inv_summary_tab();

    -- Explicit cursor
    CURSOR cur_inventory (p_bid NUMBER) IS
        SELECT bt.blood_group,
               NVL(SUM(bi.units), 0)                             AS total_units,
               COUNT(CASE WHEN bi.expiry_date < SYSDATE + 7
                          THEN 1 END)                             AS expiring_soon
          FROM blood_inventory bi
          JOIN blood_type bt ON bi.blood_type_id = bt.blood_type_id
         WHERE bi.bank_id     = p_bid
           AND bi.expiry_date > SYSDATE
         GROUP BY bt.blood_group;

    v_inv_rec cur_inventory%ROWTYPE;
    v_idx     VARCHAR2(5);
    v_sum_rec inventory_summary_rec;
BEGIN
    -- Fetch bank details using %ROWTYPE
    BEGIN
        SELECT * INTO v_bank_row FROM blood_bank WHERE bank_id = p_bank_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('ERROR: Bank ID ' || p_bank_id || ' not found.');
            RETURN;
        WHEN TOO_MANY_ROWS THEN
            DBMS_OUTPUT.PUT_LINE('ERROR: Multiple banks returned — check data.');
            RETURN;
    END;

    DBMS_OUTPUT.PUT_LINE('=== Inventory Report: ' || v_bank_row.bank_name || ' ===');

    -- Open and fetch explicit cursor
    OPEN cur_inventory(p_bank_id);
    LOOP
        FETCH cur_inventory INTO v_inv_rec;
        EXIT WHEN cur_inventory%NOTFOUND;

        -- Populate associative array
        v_units_arr(v_inv_rec.blood_group) := v_inv_rec.total_units;

        -- Extend nested table and populate
        v_sum_rec.blood_group  := v_inv_rec.blood_group;
        v_sum_rec.total_units  := v_inv_rec.total_units;
        v_sum_rec.expiry_count := v_inv_rec.expiring_soon;

        v_summary_tab.EXTEND;
        v_summary_tab(v_summary_tab.COUNT) := v_sum_rec;
    END LOOP;
    CLOSE cur_inventory;

    -- Print from nested table using collection methods
    DBMS_OUTPUT.PUT_LINE('Blood Group Summary (' || v_summary_tab.COUNT || ' types found):');

    IF v_summary_tab.COUNT > 0 THEN
        FOR i IN v_summary_tab.FIRST .. v_summary_tab.LAST LOOP
            IF v_summary_tab.EXISTS(i) THEN
                DBMS_OUTPUT.PUT_LINE(
                    '  ' || v_summary_tab(i).blood_group ||
                    ' | Units: ' || v_summary_tab(i).total_units ||
                    ' | Expiring Soon: ' || v_summary_tab(i).expiry_count
                );
            END IF;
        END LOOP;
    END IF;

    -- Navigate associative array
    DBMS_OUTPUT.PUT_LINE('--- Associative Array Walkthrough ---');
    v_idx := v_units_arr.FIRST;
    WHILE v_idx IS NOT NULL LOOP
        DBMS_OUTPUT.PUT_LINE('  ' || v_idx || ': ' || v_units_arr(v_idx) || ' unit(s)');
        v_idx := v_units_arr.NEXT(v_idx);
    END LOOP;

    -- Delete one element to demo DELETE method
    IF v_units_arr.COUNT > 0 THEN
        v_idx := v_units_arr.FIRST;
        v_units_arr.DELETE(v_idx);
        DBMS_OUTPUT.PUT_LINE('After DELETE first key, array count: ' || v_units_arr.COUNT);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        IF cur_inventory%ISOPEN THEN CLOSE cur_inventory; END IF;
        DBMS_OUTPUT.PUT_LINE('ERROR in generate_inventory_report: ' || SQLERRM);
END generate_inventory_report;
/