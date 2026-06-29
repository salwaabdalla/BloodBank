CONNECT bloodbank/bloodbank123;
SHOW USER;

-- SEQUENCES
CREATE SEQUENCE seq_blood_type START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_blood_bank START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_hospital START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_staff START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_donor START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_patient START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_camp START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_appointment START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_donation START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_medical_test START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_inventory START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_blood_request START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_transfusion START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_payment START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_notification START WITH 1 INCREMENT BY 1;

-- 1) BLOOD_TYPE
CREATE TABLE blood_type (
    blood_type_id NUMBER PRIMARY KEY,
    blood_group   VARCHAR2(5)   UNIQUE NOT NULL,
    rh_factor     VARCHAR2(2)   NOT NULL,
    description   VARCHAR2(200)
);

-- 2) BLOOD_BANK
CREATE TABLE blood_bank (
    bank_id   NUMBER PRIMARY KEY,
    bank_name VARCHAR2(100) NOT NULL,
    address   VARCHAR2(200),
    city      VARCHAR2(50),
    phone     VARCHAR2(20),
    email     VARCHAR2(100),
    is_active VARCHAR2(1)
);

-- 3) HOSPITAL
CREATE TABLE hospital (
    hospital_id   NUMBER PRIMARY KEY,
    hospital_name VARCHAR2(100) NOT NULL,
    address       VARCHAR2(200),
    city          VARCHAR2(50),
    phone         VARCHAR2(20),
    email         VARCHAR2(100),
    hospital_type VARCHAR2(20)
);

-- 4) STAFF
CREATE TABLE staff (
    staff_id   NUMBER PRIMARY KEY,
    bank_id    NUMBER NOT NULL,
    first_name VARCHAR2(50),
    last_name  VARCHAR2(50),
    role       VARCHAR2(20),
    phone      VARCHAR2(20),
    hire_date  DATE,
    CONSTRAINT fk_staff_bank FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- 5) DONOR
CREATE TABLE donor (
    donor_id      NUMBER PRIMARY KEY,
    blood_type_id NUMBER NOT NULL,
    first_name    VARCHAR2(50),
    last_name     VARCHAR2(50),
    gender        VARCHAR2(1),
    date_of_birth DATE,
    phone         VARCHAR2(20),
    email         VARCHAR2(100),
    is_eligible   VARCHAR2(1),
    CONSTRAINT fk_donor_blood FOREIGN KEY (blood_type_id) REFERENCES blood_type(blood_type_id)
);

-- 6) PATIENT
CREATE TABLE patient (
    patient_id    NUMBER PRIMARY KEY,
    hospital_id   NUMBER NOT NULL,
    blood_type_id NUMBER NOT NULL,
    first_name    VARCHAR2(50),
    last_name     VARCHAR2(50),
    gender        VARCHAR2(1),
    date_of_birth DATE,
    phone         VARCHAR2(20),
    admission_date DATE,
    CONSTRAINT fk_patient_hospital FOREIGN KEY (hospital_id)   REFERENCES hospital(hospital_id),
    CONSTRAINT fk_patient_blood    FOREIGN KEY (blood_type_id) REFERENCES blood_type(blood_type_id)
);

-- 7) CAMP
CREATE TABLE camp (
    camp_id       NUMBER PRIMARY KEY,
    bank_id       NUMBER NOT NULL,
    camp_name     VARCHAR2(100),
    location      VARCHAR2(200),
    camp_date     DATE,
    target_donors NUMBER,
    status        VARCHAR2(20),
    CONSTRAINT fk_camp_bank FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- 8) APPOINTMENT
CREATE TABLE appointment (
    appointment_id NUMBER PRIMARY KEY,
    donor_id       NUMBER NOT NULL,
    camp_id        NUMBER NOT NULL,
    appt_date      DATE,
    appt_time      VARCHAR2(10),
    status         VARCHAR2(20),
    notes          VARCHAR2(200),
    CONSTRAINT fk_appt_donor FOREIGN KEY (donor_id) REFERENCES donor(donor_id),
    CONSTRAINT fk_appt_camp  FOREIGN KEY (camp_id)  REFERENCES camp(camp_id)
);

-- 9) DONATION
CREATE TABLE donation (
    donation_id    NUMBER PRIMARY KEY,
    donor_id       NUMBER NOT NULL,
    blood_type_id  NUMBER NOT NULL,
    bank_id        NUMBER NOT NULL,
    camp_id        NUMBER NOT NULL,
    donation_date  DATE,
    units          NUMBER,
    status         VARCHAR2(20),
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id)      REFERENCES donor(donor_id),
    CONSTRAINT fk_donation_blood FOREIGN KEY (blood_type_id) REFERENCES blood_type(blood_type_id),
    CONSTRAINT fk_donation_bank  FOREIGN KEY (bank_id)       REFERENCES blood_bank(bank_id),
    CONSTRAINT fk_donation_camp  FOREIGN KEY (camp_id)       REFERENCES camp(camp_id)
);

-- 10) MEDICAL_TEST
CREATE TABLE medical_test (
    test_id     NUMBER PRIMARY KEY,
    donation_id NUMBER NOT NULL,
    test_type   VARCHAR2(20),
    test_date   DATE,
    result      VARCHAR2(20),
    tested_by   VARCHAR2(50),
    CONSTRAINT fk_test_donation FOREIGN KEY (donation_id) REFERENCES donation(donation_id)
);

-- 11) BLOOD_INVENTORY
CREATE TABLE blood_inventory (
    inventory_id  NUMBER PRIMARY KEY,
    bank_id       NUMBER NOT NULL,
    blood_type_id NUMBER NOT NULL,
    units         NUMBER,
    collection_date DATE,
    expiry_date   DATE,
    CONSTRAINT fk_inv_bank  FOREIGN KEY (bank_id)       REFERENCES blood_bank(bank_id),
    CONSTRAINT fk_inv_blood FOREIGN KEY (blood_type_id) REFERENCES blood_type(blood_type_id)
);

-- 12) BLOOD_REQUEST
CREATE TABLE blood_request (
    request_id    NUMBER PRIMARY KEY,
    hospital_id   NUMBER NOT NULL,
    blood_type_id NUMBER NOT NULL,
    patient_id    NUMBER NOT NULL,
    units         NUMBER,
    urgency       VARCHAR2(20),
    request_date  DATE,
    status        VARCHAR2(20),
    CONSTRAINT fk_req_hospital FOREIGN KEY (hospital_id)   REFERENCES hospital(hospital_id),
    CONSTRAINT fk_req_blood    FOREIGN KEY (blood_type_id) REFERENCES blood_type(blood_type_id),
    CONSTRAINT fk_req_patient  FOREIGN KEY (patient_id)    REFERENCES patient(patient_id)
);

-- 13) TRANSFUSION
CREATE TABLE transfusion (
    transfusion_id NUMBER PRIMARY KEY,
    bank_id        NUMBER NOT NULL,
    patient_id     NUMBER NOT NULL,
    request_id     NUMBER NOT NULL,
    transfusion_date DATE,
    units          NUMBER,
    notes          VARCHAR2(200),
    CONSTRAINT fk_trans_bank    FOREIGN KEY (bank_id)     REFERENCES blood_bank(bank_id),
    CONSTRAINT fk_trans_patient FOREIGN KEY (patient_id)  REFERENCES patient(patient_id),
    CONSTRAINT fk_trans_request FOREIGN KEY (request_id)  REFERENCES blood_request(request_id)
);

-- 14) PAYMENT
CREATE TABLE payment (
    payment_id     NUMBER PRIMARY KEY,
    request_id     NUMBER NOT NULL,
    patient_id     NUMBER NOT NULL,
    amount         NUMBER(10,2),
    payment_date   DATE,
    payment_method VARCHAR2(20),
    status         VARCHAR2(20),
    CONSTRAINT fk_pay_request FOREIGN KEY (request_id) REFERENCES blood_request(request_id),
    CONSTRAINT fk_pay_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
);

-- 15) NOTIFICATION
CREATE TABLE notification (
    notification_id NUMBER PRIMARY KEY,
    donor_id        NUMBER,
    patient_id      NUMBER,
    message         VARCHAR2(500),
    sent_date       DATE,
    notif_type      VARCHAR2(20),
    is_read         VARCHAR2(1),
    CONSTRAINT fk_notif_donor   FOREIGN KEY (donor_id)   REFERENCES donor(donor_id),
    CONSTRAINT fk_notif_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
);