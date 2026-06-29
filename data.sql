-- SEQUENCES

CONNECT bloodbank/bloodbank123;
SHOW USER;

Show user
ALTER USER bloodbank QUOTA UNLIMITED ON users;
-------------------------------------
 --1) BLOOD_TYPE
-------------------------------------
SELECT * FROM blood_type;
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'A+',  '+', 'Most common, universal plasma donor');
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'A-',  '-', 'Rare, can donate to A+ and AB+');
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'B+',  '+', 'Common in Asian populations');
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'B-',  '-', 'Rare, important for emergencies');
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'AB+', '+', 'Universal recipient');
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'AB-', '-', 'Rarest type, universal plasma donor');
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'O+',  '+', 'Most donated type globally');
INSERT INTO blood_type VALUES (seq_blood_type.NEXTVAL, 'O-',  '-', 'Universal red cell donor');
COMMIT;

-------------------------------------
 --2) BLOOD_BANK
-------------------------------------
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'LifeFlow Blood Bank',      '12 King St',          'Cairo',        '0201112345', 'lifeflow@bb.com',  'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'HopeBank Central',         '45 Nile Ave',         'Cairo',        '0201112346', 'hopebank@bb.com',  'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'RedCross Depot',           '78 Liberty Rd',       'Alexandria',   '0301112347', 'redcross@bb.com',  'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Alexandria Blood Hub',     '22 Sea View Blvd',    'Alexandria',   '0301112348', 'alexhub@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Giza Blood Center',        '5 Pyramids Rd',       'Giza',         '0201112349', 'gizabc@bb.com',    'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Mansoura Life Bank',       '99 University St',    'Mansoura',     '0501112350', 'manslife@bb.com',  'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'National Blood Authority', '1 Health Blvd',       'Cairo',        '0201112351', 'nba@bb.com',       'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Suez Canal Blood Bank',    '30 Canal Rd',         'Ismailia',     '0641112352', 'suezbb@bb.com',    'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Tanta Blood Services',     '17 Cotton Ave',       'Tanta',        '0401112353', 'tantabs@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Luxor Donor Center',       '3 Temple Rd',         'Luxor',        '0951112354', 'luxordc@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Aswan Blood Reserve',      '8 Dam St',            'Aswan',        '0971112355', 'aswanbc@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Delta Blood Unit',         '62 Delta Rd',         'Zagazig',      '0551112356', 'deltabu@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'North Coast Blood Bank',   '14 Shore Blvd',       'Marsa Matruh', '0461112357', 'northbb@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'South Valley Center',      '25 Valley Rd',        'Sohag',        '0931112358', 'southvc@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Fayoum Blood Bank',        '11 Lake Ave',         'Fayoum',       '0841112359', 'fayoumbb@bb.com',  'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Helwan Donation Hub',      '7 Industrial Zone',   'Helwan',       '0201112360', 'helwandh@bb.com',  'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Sinai Blood Center',       '19 Desert Rd',        'El Arish',     '0681112361', 'sinaibc@bb.com',   'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Port Said Blood Bank',     '55 Harbor St',        'Port Said',    '0661112362', 'portbb@bb.com',    'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Beni Suef Center',         '33 Nile Bank Rd',     'Beni Suef',    '0821112363', 'benibc@bb.com',    'Y');
INSERT INTO blood_bank VALUES (seq_blood_bank.NEXTVAL, 'Minya Blood Services',     '44 University Ave',   'Minya',        '0861112364', 'minyabs@bb.com',   'Y');
COMMIT;

-------------------------------------
 --3) HOSPITAL
-------------------------------------
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Cairo University Hospital',    '1 Kasr Al Aini St',      'Cairo',      '0201234001', 'cuh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Ain Shams Medical Center',     '38 Abbasia Sq',          'Cairo',      '0201234002', 'asmc@hosp.com',  'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Alex National Hospital',       '5 El Horriya Rd',        'Alexandria', '0301234003', 'anh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'El Salam Private Hospital',    '90 Maadi Rd',            'Cairo',      '0201234004', 'salam@hosp.com', 'PRIVATE');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Nile Medical Hospital',        '12 Corniche El Nil',     'Giza',       '0201234005', 'nile@hosp.com',  'PRIVATE');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Military Medical Academy',     '2 Cairo-Suez Rd',        'Cairo',      '0201234006', 'mma@hosp.com',   'MILITARY');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Mansoura University Hospital', '60 El Gomhoria St',      'Mansoura',   '0501234007', 'muh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Suez General Hospital',        '3 Port Tawfiq',          'Suez',       '0621234008', 'suez@hosp.com',  'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Tanta University Hospital',    '8 El Bahr St',           'Tanta',      '0401234009', 'tuh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Luxor International Hospital', '17 TV St',               'Luxor',      '0951234010', 'lih@hosp.com',   'PRIVATE');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Aswan Heart Centre',           '4 Corniche St',          'Aswan',      '0971234011', 'ahc@hosp.com',   'PRIVATE');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Zagazig University Hospital',  '21 University St',       'Zagazig',    '0551234012', 'zuh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'El Galaa Military Hospital',   '15 El Galaa Sq',         'Cairo',      '0201234013', 'galaa@hosp.com', 'MILITARY');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Sohag University Hospital',    '9 University Blvd',      'Sohag',      '0931234014', 'suh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Fayoum General Hospital',      '6 Hawary St',            'Fayoum',     '0841234015', 'fgh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Helwan General Hospital',      '22 Workers City Rd',     'Helwan',     '0201234016', 'hgh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'El Arish General Hospital',    '30 El Arish Blvd',       'El Arish',   '0681234017', 'eagh@hosp.com',  'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Port Said Hospital',           '7 El Sharq St',          'Port Said',  '0661234018', 'psh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Beni Suef Hospital',           '14 Nile St',             'Beni Suef',  '0821234019', 'bsh@hosp.com',   'PUBLIC');
INSERT INTO hospital VALUES (seq_hospital.NEXTVAL, 'Minya University Hospital',    '33 El Azhar St',         'Minya',      '0861234020', 'muh2@hosp.com',  'PUBLIC');
COMMIT;

-------------------------------------
 --4) STAFF
-------------------------------------
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 1,  'Ahmed',   'Hassan',   'DOCTOR',      '0111000001', DATE '2020-01-15');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 1,  'Sara',    'Ali',      'NURSE',       '0111000002', DATE '2021-03-10');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 2,  'Omar',    'Khalil',   'TECHNICIAN',  '0111000003', DATE '2019-06-01');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 2,  'Mona',    'Ibrahim',  'COORDINATOR', '0111000004', DATE '2022-09-20');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 3,  'Karim',   'Mostafa',  'DOCTOR',      '0111000005', DATE '2018-11-05');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 3,  'Nadia',   'Saleh',    'NURSE',       '0111000006', DATE '2023-01-12');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 4,  'Youssef', 'Farouk',   'ADMIN',       '0111000007', DATE '2020-07-07');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 4,  'Hana',    'Gamal',    'TECHNICIAN',  '0111000008', DATE '2021-05-18');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 5,  'Tarek',   'Nasser',   'DOCTOR',      '0111000009', DATE '2017-04-22');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 5,  'Rana',    'Adel',     'NURSE',       '0111000010', DATE '2022-08-30');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 6,  'Bassem',  'Zaki',     'COORDINATOR', '0111000011', DATE '2019-12-01');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 6,  'Dina',    'Wahba',    'TECHNICIAN',  '0111000012', DATE '2020-03-25');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 7,  'Walid',   'Shafik',   'ADMIN',       '0111000013', DATE '2021-10-10');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 7,  'Laila',   'Ramadan',  'NURSE',       '0111000014', DATE '2022-02-14');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 8,  'Samer',   'Fouad',    'DOCTOR',      '0111000015', DATE '2016-09-09');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 8,  'Noha',    'Mansour',  'TECHNICIAN',  '0111000016', DATE '2023-06-06');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 9,  'Fady',    'Girgis',   'COORDINATOR', '0111000017', DATE '2018-07-17');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 9,  'Reham',   'Sobhy',    'NURSE',       '0111000018', DATE '2020-11-11');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 10, 'Hazem',   'El-Sayed', 'ADMIN',       '0111000019', DATE '2021-04-04');
INSERT INTO staff VALUES (seq_staff.NEXTVAL, 10, 'Yasmin',  'Taha',     'DOCTOR',      '0111000020', DATE '2022-12-20');
COMMIT;

-------------------------------------
 --5) DONOR
-------------------------------------
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 7, 'Mohamed', 'Salama',  'M', DATE '1990-05-12', '0122000001', 'msalama@mail.com',  'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 1, 'Fatma',   'Kamal',   'F', DATE '1988-11-03', '0122000002', 'fkamal@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 3, 'Khaled',  'Saad',    'M', DATE '1995-02-20', '0122000003', 'ksaad@mail.com',    'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 5, 'Amira',   'Fathy',   'F', DATE '1992-07-14', '0122000004', 'afathy@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 2, 'Hassan',  'Yousry',  'M', DATE '1985-09-30', '0122000005', 'hyousry@mail.com',  'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 8, 'Nour',    'Samir',   'F', DATE '1997-01-25', '0122000006', 'nsamir@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 4, 'Adel',    'Barakat', 'M', DATE '1983-06-08', '0122000007', 'abarakat@mail.com', 'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 6, 'Asmaa',   'Lotfy',   'F', DATE '1993-12-17', '0122000008', 'alotfy@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 1, 'Rami',    'Emad',    'M', DATE '1996-04-05', '0122000009', 'remad@mail.com',    'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 7, 'Heba',    'Gamal',   'F', DATE '1991-08-22', '0122000010', 'hgamal@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 3, 'Sherif',  'Nabil',   'M', DATE '1987-03-16', '0122000011', 'snabil@mail.com',   'N');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 2, 'Ghada',   'Hamdy',   'F', DATE '1994-10-09', '0122000012', 'ghamdy@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 5, 'Islam',   'Ragab',   'M', DATE '1998-07-27', '0122000013', 'iragab@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 8, 'Mariam',  'Wael',    'F', DATE '2000-02-14', '0122000014', 'mwael@mail.com',    'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 6, 'Tamer',   'Rizk',    'M', DATE '1989-05-31', '0122000015', 'trizk@mail.com',    'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 4, 'Hend',    'Abbas',   'F', DATE '1986-09-04', '0122000016', 'habbas@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 7, 'Mahmoud', 'Gouda',   'M', DATE '1999-11-19', '0122000017', 'mgouda@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 1, 'Dalia',   'Fahmy',   'F', DATE '1993-06-06', '0122000018', 'dfahmy@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 3, 'Ayman',   'Helal',   'M', DATE '1990-01-28', '0122000019', 'ahelal@mail.com',   'Y');
INSERT INTO donor VALUES (seq_donor.NEXTVAL, 5, 'Ola',     'Sabry',   'F', DATE '1995-08-13', '0122000020', 'osabry@mail.com',   'Y');
COMMIT;

-------------------------------------
 --6) PATIENT
-------------------------------------
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 1,  5, 'Samir',   'Gaber',    'M', DATE '1955-04-10', '0133000001', DATE '2026-01-05');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 2,  1, 'Wafaa',   'Ismail',   'F', DATE '1970-07-22', '0133000002', DATE '2026-01-08');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 3,  3, 'Essam',   'Morsi',    'M', DATE '1945-11-30', '0133000003', DATE '2026-01-10');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 4,  7, 'Maha',    'Zidan',    'F', DATE '1988-02-14', '0133000004', DATE '2026-01-12');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 5,  2, 'Gamal',   'Bakr',     'M', DATE '1962-09-05', '0133000005', DATE '2026-01-15');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 6,  8, 'Iman',    'Saber',    'F', DATE '1990-06-18', '0133000006', DATE '2026-01-17');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 7,  4, 'Wahid',   'Nassar',   'M', DATE '1975-03-25', '0133000007', DATE '2026-01-20');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 8,  6, 'Neveen',  'Shehata',  'F', DATE '1980-12-01', '0133000008', DATE '2026-01-22');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 9,  1, 'Refaat',  'Abdulla',  'M', DATE '1950-08-16', '0133000009', DATE '2026-01-25');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 10, 5, 'Abeer',   'Hafez',    'F', DATE '1993-05-07', '0133000010', DATE '2026-02-01');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 11, 7, 'Emad',    'Selim',    'M', DATE '1968-10-14', '0133000011', DATE '2026-02-03');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 12, 3, 'Samira',  'Moustafa', 'F', DATE '1985-01-20', '0133000012', DATE '2026-02-05');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 13, 2, 'Hossam',  'Badran',   'M', DATE '1972-04-02', '0133000013', DATE '2026-02-08');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 14, 6, 'Amal',    'Serag',    'F', DATE '1960-07-30', '0133000014', DATE '2026-02-10');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 15, 4, 'Osama',   'Hamza',    'M', DATE '1978-11-11', '0133000015', DATE '2026-02-12');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 16, 8, 'Azza',    'Khalifa',  'F', DATE '1995-03-08', '0133000016', DATE '2026-02-15');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 17, 1, 'Nasser',  'Fouda',    'M', DATE '1948-06-23', '0133000017', DATE '2026-02-18');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 18, 5, 'Hala',    'Eid',      'F', DATE '1983-09-14', '0133000018', DATE '2026-02-20');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 19, 7, 'Ihab',    'Rizq',     'M', DATE '1965-02-28', '0133000019', DATE '2026-02-22');
INSERT INTO patient VALUES (seq_patient.NEXTVAL, 20, 3, 'Suzan',   'Atef',     'F', DATE '1991-12-05', '0133000020', DATE '2026-02-25');
COMMIT;

-------------------------------------
 --7) CAMP
-------------------------------------
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 1,  'Cairo Ramadan Drive',      'Cairo Stadium',         DATE '2026-03-01', 100, 'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 2,  'HopeBank City Camp',       'Tahrir Square',         DATE '2026-03-05', 80,  'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 3,  'Alex Blood Drive',         'Alexandria Library',    DATE '2026-03-10', 90,  'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 4,  'University Donation Day',  'AUC Campus',            DATE '2026-03-15', 120, 'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 5,  'Giza Community Camp',      'Giza Community Center', DATE '2026-03-20', 70,  'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 6,  'Mansoura Drive',           'Mansoura University',   DATE '2026-03-25', 60,  'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 7,  'National Health Day',      'Health Ministry Plaza', DATE '2026-04-01', 200, 'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 8,  'Suez Canal Camp',          'Suez City Hall',        DATE '2026-04-05', 50,  'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 9,  'Delta Region Drive',       'Tanta Sports Club',     DATE '2026-04-08', 75,  'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 10, 'Upper Egypt Campaign',     'Luxor Cultural Center', DATE '2026-04-12', 55,  'COMPLETED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 1,  'Spring Donation Festival', 'Cairo Opera House',     DATE '2026-04-20', 150, 'ONGOING');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 2,  'HopeBank Spring Drive',    'Smart Village',         DATE '2026-04-22', 100, 'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 3,  'Alex May Campaign',        'Smouha Club',           DATE '2026-05-01', 80,  'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 4,  'Student Donation Day',     'GUC Campus',            DATE '2026-05-05', 90,  'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 5,  'World Blood Day Camp',     'Giza Stadium',          DATE '2026-06-14', 200, 'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 6,  'Summer Drive Mansoura',    'Mansoura City Center',  DATE '2026-06-20', 70,  'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 7,  'Ministry Annual Camp',     'Cairo Intl Fair',       DATE '2026-07-01', 300, 'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 8,  'Port Said Drive',          'Port Said Stadium',     DATE '2026-07-10', 60,  'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 9,  'Nile Festival Campaign',   'Tanta Corniche',        DATE '2026-07-20', 85,  'SCHEDULED');
INSERT INTO camp VALUES (seq_camp.NEXTVAL, 10, 'Tourism Blood Drive',      'Luxor Temple Area',     DATE '2026-08-01', 50,  'SCHEDULED');
COMMIT;

-------------------------------------
 --8) APPOINTMENT
-------------------------------------
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 1,  1, DATE '2026-03-01', '09:00', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 2,  1, DATE '2026-03-01', '09:30', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 3,  2, DATE '2026-03-05', '10:00', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 4,  2, DATE '2026-03-05', '10:30', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 5,  3, DATE '2026-03-10', '11:00', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 6,  3, DATE '2026-03-10', '11:30', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 7,  4, DATE '2026-03-15', '09:00', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 8,  4, DATE '2026-03-15', '09:30', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 9,  5, DATE '2026-03-20', '10:00', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 10, 5, DATE '2026-03-20', '10:30', 'COMPLETED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 11, 1, DATE '2026-04-20', '09:00', 'CONFIRMED', 'First time donor');
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 12, 1, DATE '2026-04-20', '09:30', 'CONFIRMED', NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 13, 2, DATE '2026-04-22', '10:00', 'PENDING',   NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 14, 2, DATE '2026-04-22', '10:30', 'PENDING',   NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 15, 3, DATE '2026-05-01', '11:00', 'PENDING',   NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 16, 3, DATE '2026-05-01', '11:30', 'PENDING',   NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 17, 4, DATE '2026-05-05', '09:00', 'PENDING',   NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 18, 4, DATE '2026-05-05', '09:30', 'CANCELLED', 'Donor unwell');
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 19, 5, DATE '2026-06-14', '10:00', 'PENDING',   NULL);
INSERT INTO appointment VALUES (seq_appointment.NEXTVAL, 20, 5, DATE '2026-06-14', '10:30', 'PENDING',   NULL);
COMMIT;

-------------------------------------
 --9) DONATION
-------------------------------------
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 1,  7, 1,  1,  DATE '2026-03-01', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 2,  1, 1,  1,  DATE '2026-03-01', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 3,  3, 2,  2,  DATE '2026-03-05', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 4,  5, 2,  2,  DATE '2026-03-05', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 5,  2, 3,  3,  DATE '2026-03-10', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 6,  8, 3,  3,  DATE '2026-03-10', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 7,  4, 4,  4,  DATE '2026-03-15', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 8,  6, 4,  4,  DATE '2026-03-15', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 9,  7, 5,  5,  DATE '2026-03-20', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 10, 5, 5,  5,  DATE '2026-03-20', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 11, 3, 6,  6,  DATE '2026-03-25', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 12, 8, 6,  6,  DATE '2026-03-25', 1, 'TESTED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 13, 1, 7,  7,  DATE '2026-04-01', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 14, 7, 7,  7,  DATE '2026-04-01', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 15, 2, 8,  8,  DATE '2026-04-05', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 16, 5, 8,  8,  DATE '2026-04-05', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 17, 6, 9,  9,  DATE '2026-04-08', 1, 'TESTED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 18, 4, 9,  9,  DATE '2026-04-08', 1, 'REJECTED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 19, 3, 10, 10, DATE '2026-04-12', 1, 'APPROVED');
INSERT INTO donation VALUES (seq_donation.NEXTVAL, 20, 7, 10, 10, DATE '2026-04-12', 1, 'COLLECTED');
COMMIT;

-------------------------------------
 --10) MEDICAL_TEST
-------------------------------------
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 1,  'HIV',         DATE '2026-03-02', 'PASS',    'Lab Tech A');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 2,  'HEPATITIS_B', DATE '2026-03-02', 'PASS',    'Lab Tech A');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 3,  'HIV',         DATE '2026-03-06', 'PASS',    'Lab Tech B');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 4,  'HEPATITIS_C', DATE '2026-03-06', 'PASS',    'Lab Tech B');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 5,  'SYPHILIS',    DATE '2026-03-11', 'PASS',    'Lab Tech C');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 6,  'HIV',         DATE '2026-03-11', 'PASS',    'Lab Tech C');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 7,  'HEPATITIS_B', DATE '2026-03-16', 'PASS',    'Lab Tech A');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 8,  'MALARIA',     DATE '2026-03-16', 'PASS',    'Lab Tech A');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 9,  'HIV',         DATE '2026-03-21', 'PASS',    'Lab Tech D');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 10, 'HEPATITIS_C', DATE '2026-03-21', 'PASS',    'Lab Tech D');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 11, 'SYPHILIS',    DATE '2026-03-26', 'PASS',    'Lab Tech B');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 12, 'HIV',         DATE '2026-03-26', 'PENDING', 'Lab Tech B');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 13, 'HEPATITIS_B', DATE '2026-04-02', 'PASS',    'Lab Tech C');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 14, 'HIV',         DATE '2026-04-02', 'PASS',    'Lab Tech C');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 15, 'MALARIA',     DATE '2026-04-06', 'PASS',    'Lab Tech A');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 16, 'HEPATITIS_C', DATE '2026-04-06', 'PASS',    'Lab Tech A');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 17, 'SYPHILIS',    DATE '2026-04-09', 'PENDING', 'Lab Tech D');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 18, 'HIV',         DATE '2026-04-09', 'FAIL',    'Lab Tech D');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 19, 'HEPATITIS_B', DATE '2026-04-13', 'PASS',    'Lab Tech B');
INSERT INTO medical_test VALUES (seq_medical_test.NEXTVAL, 20, 'HIV',         DATE '2026-04-13', 'PASS',    'Lab Tech B');
COMMIT;

-------------------------------------
 --11) BLOOD_INVENTORY
-------------------------------------
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 1,  1, 15.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 1,  7, 20.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 2,  3, 10.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 2,  5, 8.0,  DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 3,  2, 12.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 3,  8, 5.0,  DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 4,  4, 7.0,  DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 4,  6, 9.0,  DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 5,  1, 18.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 5,  7, 14.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 6,  3, 11.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 6,  5, 6.0,  DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 7,  2, 22.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 7,  8, 3.0,  DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 8,  4, 16.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 8,  6, 13.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 9,  1, 25.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 9,  3, 9.0,  DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 10, 7, 17.0, DATE '2026-04-15', DATE '2026-07-15');
INSERT INTO blood_inventory VALUES (seq_inventory.NEXTVAL, 10, 5, 4.0,  DATE '2026-04-15', DATE '2026-07-15');
COMMIT;

-------------------------------------
 --12) BLOOD_REQUEST
-------------------------------------
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 1,  5, 1,  2, 'CRITICAL', DATE '2026-04-01', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 2,  1, 2,  1, 'HIGH',     DATE '2026-04-02', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 3,  3, 3,  3, 'NORMAL',   DATE '2026-04-03', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 4,  7, 4,  3, 'HIGH',     DATE '2026-04-04', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 5,  2, 5,  2, 'NORMAL',   DATE '2026-04-05', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 6,  8, 6,  2, 'CRITICAL', DATE '2026-04-06', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 7,  4, 7,  1, 'HIGH',     DATE '2026-04-07', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 8,  6, 8,  2, 'NORMAL',   DATE '2026-04-08', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 9,  1, 9,  3, 'CRITICAL', DATE '2026-04-09', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 10, 5, 10, 1, 'HIGH',     DATE '2026-04-10', 'FULFILLED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 11, 7, 11, 2, 'NORMAL',   DATE '2026-04-11', 'APPROVED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 12, 3, 12, 1, 'HIGH',     DATE '2026-04-12', 'APPROVED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 13, 2, 13, 3, 'CRITICAL', DATE '2026-04-13', 'PENDING');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 14, 6, 14, 2, 'NORMAL',   DATE '2026-04-14', 'PENDING');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 15, 4, 15, 1, 'HIGH',     DATE '2026-04-15', 'PENDING');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 16, 8, 16, 2, 'CRITICAL', DATE '2026-04-16', 'PENDING');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 17, 1, 17, 3, 'NORMAL',   DATE '2026-04-17', 'PENDING');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 18, 5, 18, 1, 'HIGH',     DATE '2026-04-18', 'REJECTED');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 19, 7, 19, 2, 'CRITICAL', DATE '2026-04-19', 'PENDING');
INSERT INTO blood_request VALUES (seq_blood_request.NEXTVAL, 20, 3, 20, 1, 'NORMAL',   DATE '2026-04-20', 'PENDING');
COMMIT;

-------------------------------------
 --13) TRANSFUSION
-------------------------------------
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 1,  9,  1,  DATE '2026-04-01', 2, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 2,  1,  2,  DATE '2026-04-02', 1, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 3,  3,  3,  DATE '2026-04-03', 3, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 4,  7,  4,  DATE '2026-04-04', 3, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 5,  2,  5,  DATE '2026-04-05', 2, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 6,  6,  6,  DATE '2026-04-06', 2, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 7,  4,  7,  DATE '2026-04-07', 1, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 8,  8,  8,  DATE '2026-04-08', 2, 'Minor reaction');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 9,  17, 9,  DATE '2026-04-09', 3, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 10, 10, 10, DATE '2026-04-10', 1, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 1,  11, 11, DATE '2026-04-11', 2, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 2,  12, 12, DATE '2026-04-12', 1, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 3,  13, 13, DATE '2026-04-13', 3, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 4,  14, 14, DATE '2026-04-14', 2, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 5,  15, 15, DATE '2026-04-15', 1, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 6,  16, 16, DATE '2026-04-16', 2, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 7,  17, 17, DATE '2026-04-17', 3, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 8,  18, 18, DATE '2026-04-18', 1, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 9,  19, 19, DATE '2026-04-19', 2, 'Successful');
INSERT INTO transfusion VALUES (seq_transfusion.NEXTVAL, 10, 20, 20, DATE '2026-04-20', 3, 'Successful');
COMMIT;

-------------------------------------
 --14) PAYMENT
-------------------------------------
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 1,  1,  500.00, DATE '2026-04-02', 'INSURANCE',     'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 2,  2,  300.00, DATE '2026-04-03', 'CASH',          'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 3,  3,  400.00, DATE '2026-04-04', 'BANK_TRANSFER', 'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 4,  3,  350.00, DATE '2026-04-05', 'INSURANCE',     'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 5,  5,  250.00, DATE '2026-04-06', 'CASH',          'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 6,  2,  600.00, DATE '2026-04-07', 'INSURANCE',     'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 7,  7,  450.00, DATE '2026-04-08', 'BANK_TRANSFER', 'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 8,  4,  0.00,   DATE '2026-04-09', 'WAIVED',        'WAIVED');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 9,  1,  550.00, DATE '2026-04-10', 'INSURANCE',     'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 10, 5,  200.00, DATE '2026-04-11', 'CASH',          'PAID');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 11, 11, 320.00, DATE '2026-04-12', 'INSURANCE',     'PENDING');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 12, 12, 410.00, DATE '2026-04-13', 'BANK_TRANSFER', 'PENDING');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 13, 13, 480.00, DATE '2026-04-14', 'CASH',          'PENDING');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 14, 14, 290.00, DATE '2026-04-15', 'INSURANCE',     'PENDING');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 15, 15, 375.00, DATE '2026-04-16', 'CASH',          'PENDING');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 16, 16, 520.00, DATE '2026-04-17', 'BANK_TRANSFER', 'OVERDUE');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 17, 17, 160.00, DATE '2026-04-18', 'CASH',          'PENDING');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 18, 18, 430.00, DATE '2026-04-19', 'INSURANCE',     'PENDING');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 19, 19, 0.00,   DATE '2026-04-20', 'WAIVED',        'WAIVED');
INSERT INTO payment VALUES (seq_payment.NEXTVAL, 20, 20, 270.00, DATE '2026-04-20', 'CASH',          'PENDING');
COMMIT;

-------------------------------------
 --15) NOTIFICATION
-------------------------------------
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 1,  NULL, 'Your appointment is confirmed for March 1.',       DATE '2026-02-25', 'APPOINTMENT', 'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 2,  NULL, 'Thank you for your donation on March 1.',          DATE '2026-03-01', 'DONATION',    'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 3,  NULL, 'Your appointment is confirmed for March 5.',       DATE '2026-03-01', 'APPOINTMENT', 'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, NULL, 1,  'Your blood request has been approved.',            DATE '2026-04-01', 'REQUEST',     'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, NULL, 2,  'Your transfusion is scheduled for April 2.',       DATE '2026-04-01', 'REQUEST',     'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 5,  NULL, 'Low stock alert: B- blood is critically low.',     DATE '2026-04-03', 'LOW_STOCK',   'N');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 6,  NULL, 'Thank you for your donation on March 10.',         DATE '2026-03-10', 'DONATION',    'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, NULL, 4,  'Blood request fulfilled. Transfusion April 4.',    DATE '2026-04-04', 'REQUEST',     'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 7,  NULL, 'Reminder: Your appointment is tomorrow.',          DATE '2026-03-14', 'APPOINTMENT', 'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, NULL, 5,  'Your blood request is pending approval.',          DATE '2026-04-05', 'REQUEST',     'N');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 9,  NULL, 'Thank you for your donation on March 20.',         DATE '2026-03-20', 'DONATION',    'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 10, NULL, 'Upcoming blood donation camp on April 20.',        DATE '2026-04-10', 'GENERAL',     'N');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, NULL, 6,  'Critical blood request submitted successfully.',   DATE '2026-04-06', 'REQUEST',     'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 11, NULL, 'Your eligibility status has been updated.',        DATE '2026-04-08', 'GENERAL',     'N');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 12, NULL, 'Appointment confirmed for April 22.',              DATE '2026-04-15', 'APPOINTMENT', 'N');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, NULL, 8,  'Your transfusion was completed successfully.',     DATE '2026-04-08', 'REQUEST',     'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 14, NULL, 'AB- stock is very low. Your donation is needed!', DATE '2026-04-12', 'LOW_STOCK',   'N');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 15, NULL, 'Thank you! Your donation was approved.',           DATE '2026-04-06', 'DONATION',    'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, NULL, 10, 'Blood request has been fulfilled.',                DATE '2026-04-10', 'REQUEST',     'Y');
INSERT INTO notification VALUES (seq_notification.NEXTVAL, 17, NULL, 'Donation camp near you on June 14. Register now!',DATE '2026-04-20', 'GENERAL',     'N');
COMMIT;

-------------------------------------
 --END OF 02_data.sql
-------------------------------------
