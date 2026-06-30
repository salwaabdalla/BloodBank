-- =============================================================================
-- 04_demo.sql  |  Blood Bank Management System  |  Anonymous Block Demos
-- =============================================================================
CONNECT bloodbank/bloodbank123;

SET SERVEROUTPUT ON SIZE UNLIMITED;

-- =============================================================================
-- DEMO 1: register_donor procedure
-- =============================================================================

DECLARE
    v_new_id NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 1: register_donor ---');
    register_donor(
        p_blood_type_id => 1,
        p_first_name    => 'Abdi',
        p_last_name     => 'Warsame',
        p_gender        => 'M',
        p_dob           => DATE '1995-06-15',
        p_phone         => '0612345678',
        p_email         => 'abdi@example.com',
        p_donor_id      => v_new_id
    );
    DBMS_OUTPUT.PUT_LINE('New Donor ID: ' || v_new_id);
END;
/

-- =============================================================================
-- DEMO 2: record_donation procedure (IN OUT param)
-- =============================================================================
DECLARE
    v_don_id   NUMBER;
    v_eligible VARCHAR2(1) := 'Y';
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 2: record_donation ---');
    record_donation(
        p_donor_id      => 1,
        p_blood_type_id => 1,
        p_bank_id       => 1,
        p_camp_id       => 1,
        p_units         => 2,
        p_donation_id   => v_don_id,
        p_donor_eligible => v_eligible
    );
    DBMS_OUTPUT.PUT_LINE('Donation ID: ' || v_don_id || ' | Eligible: ' || v_eligible);
END;
/

-- =============================================================================
-- DEMO 3: process_blood_request (IN OUT param, calls check_and_deduct_inventory)
-- =============================================================================
DECLARE
    v_req_id NUMBER := 1;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 3: process_blood_request ---');
    process_blood_request(
        p_request_id => v_req_id,
        p_bank_id    => 1
    );
END;
/

-- =============================================================================
-- DEMO 4: Standalone functions called from SQL
-- =============================================================================
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 4: Standalone Functions ---');
    DBMS_OUTPUT.PUT_LINE('Total completed donations for donor 1 : '
        || get_donor_total_donations(1));
    DBMS_OUTPUT.PUT_LINE('Available units (bank 1, blood type 1): '
        || get_available_units(1, 1));
    DBMS_OUTPUT.PUT_LINE('Age of donor 1: '
        || calculate_donor_age(1) || ' years');
END;
/

-- Functions in SQL context
SELECT get_donor_total_donations(1)   AS total_donations,
       get_available_units(1, 1)      AS available_units,
       calculate_donor_age(1)         AS donor_age
FROM dual;

-- =============================================================================
-- DEMO 5: Package — update_donor_eligibility
-- =============================================================================
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 5: pkg_blood_bank.update_donor_eligibility ---');
    pkg_blood_bank.update_donor_eligibility(p_donor_id => 2, p_eligible => 'N');
    pkg_blood_bank.update_donor_eligibility(p_donor_id => 2, p_eligible => 'Y');
END;
/

-- =============================================================================
-- DEMO 6: Package — generate_camp_report (nested table + cursor FOR loop)
-- =============================================================================
DECLARE
    v_donors NUMBER;
    v_units  NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 6: pkg_blood_bank.generate_camp_report ---');
    pkg_blood_bank.generate_camp_report(
        p_camp_id      => 1,
        p_total_donors => v_donors,
        p_total_units  => v_units
    );
    DBMS_OUTPUT.PUT_LINE('Returned -> Donors: ' || v_donors || ' | Units: ' || v_units);
END;
/

-- =============================================================================
-- DEMO 7: Package function — get_bank_stock_summary (associative array)
-- =============================================================================
DECLARE
    v_stock    pkg_blood_bank.blood_stock_arr;
    v_key      VARCHAR2(5);
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 7: pkg_blood_bank.get_bank_stock_summary ---');
    v_stock := pkg_blood_bank.get_bank_stock_summary(p_bank_id => 1);

    IF v_stock.COUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No stock found for bank 1.');
    ELSE
        v_key := v_stock.FIRST;
        WHILE v_key IS NOT NULL LOOP
            DBMS_OUTPUT.PUT_LINE('  Blood Group: ' || v_key
                || ' -> Units: ' || v_stock(v_key));
            v_key := v_stock.NEXT(v_key);
        END LOOP;
    END IF;
END;
/

-- =============================================================================
-- DEMO 8: generate_inventory_report (explicit cursor, %ROWTYPE, collections)
-- =============================================================================
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 8: generate_inventory_report ---');
    generate_inventory_report(p_bank_id => 1);
END;
/

-- =============================================================================
-- DEMO 9: Trigger demonstration — BEFORE INSERT on blood_request (validation)
-- =============================================================================
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 9: Trigger trg_blood_request_before_insert ---');

    -- Valid insert (trigger sets default status/date)
    INSERT INTO blood_request (
        request_id, hospital_id, blood_type_id, patient_id,
        units, urgency, request_date, status
    ) VALUES (
        seq_blood_request.NEXTVAL, 1, 1, 1,
        2, 'High', NULL, NULL
    );
    DBMS_OUTPUT.PUT_LINE('Valid request inserted (trigger set defaults).');
    ROLLBACK;

    -- Invalid insert — bad urgency (trigger raises error)
    BEGIN
        INSERT INTO blood_request (
            request_id, hospital_id, blood_type_id, patient_id,
            units, urgency, request_date, status
        ) VALUES (
            seq_blood_request.NEXTVAL, 1, 1, 1,
            2, 'URGENT_BAD', SYSDATE, 'Pending'
        );
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Expected error caught: ' || SQLERRM);
            ROLLBACK;
    END;
END;
/

-- =============================================================================
-- DEMO 10: Trigger — AFTER INSERT on donation (auto notification)
-- =============================================================================
DECLARE
    v_notif_count_before NUMBER;
    v_notif_count_after  NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 10: Trigger trg_donation_after_insert ---');

    SELECT COUNT(*) INTO v_notif_count_before FROM notification;

    INSERT INTO donation (
        donation_id, donor_id, blood_type_id, bank_id, camp_id,
        donation_date, units, status
    ) VALUES (
        seq_donation.NEXTVAL, 3, 1, 1, 1,
        SYSDATE, 1, 'Completed'
    );

    SELECT COUNT(*) INTO v_notif_count_after FROM notification;

    DBMS_OUTPUT.PUT_LINE('Notifications before: ' || v_notif_count_before);
    DBMS_OUTPUT.PUT_LINE('Notifications after : ' || v_notif_count_after);
    DBMS_OUTPUT.PUT_LINE('New notification created by trigger: '
        || (v_notif_count_after - v_notif_count_before));
    ROLLBACK;
END;
/

-- =============================================================================
-- DEMO 11: User-defined exception + predefined Oracle exceptions
-- =============================================================================
DECLARE
    e_custom_test EXCEPTION;
    v_dummy       NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- DEMO 11: Exception Handling ---');

    -- Predefined: NO_DATA_FOUND
    BEGIN
        SELECT donor_id INTO v_dummy FROM donor WHERE donor_id = -9999;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('Caught NO_DATA_FOUND: Donor -9999 does not exist.');
    END;

    -- Predefined: TOO_MANY_ROWS
    BEGIN
        SELECT donor_id INTO v_dummy FROM donor;
    EXCEPTION
        WHEN TOO_MANY_ROWS THEN
            DBMS_OUTPUT.PUT_LINE('Caught TOO_MANY_ROWS: Multiple donors returned.');
    END;

    -- User-defined exception
    BEGIN
        RAISE e_custom_test;
    EXCEPTION
        WHEN e_custom_test THEN
            DBMS_OUTPUT.PUT_LINE('Caught user-defined exception e_custom_test.');
    END;

    DBMS_OUTPUT.PUT_LINE('All exception demos completed successfully.');
END;
/