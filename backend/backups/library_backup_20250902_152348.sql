BEGIN TRANSACTION;
CREATE TABLE books (
	id INTEGER NOT NULL, 
	access_no VARCHAR(50) NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	author_1 VARCHAR(200) NOT NULL, 
	author_2 VARCHAR(200), 
	author_3 VARCHAR(200), 
	author_4 VARCHAR(200), 
	author VARCHAR(200), 
	publisher VARCHAR(100), 
	department VARCHAR(100), 
	category VARCHAR(50), 
	location VARCHAR(50), 
	number_of_copies INTEGER, 
	available_copies INTEGER, 
	isbn VARCHAR(20), 
	pages INTEGER NOT NULL, 
	price NUMERIC(10, 2) NOT NULL, 
	edition VARCHAR(50) NOT NULL, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (access_no)
);
INSERT INTO "books" VALUES(1,'B001','Introduction to the Theory of Computation','Michael Sipser',NULL,NULL,NULL,'Michael Sipser','Cengage Learning','Computer Science','Engineering','A1-S1',1,1,'978-0123456789',450,150,'3rd','2025-08-12 14:49:09.697862');
INSERT INTO "books" VALUES(2,'B002','Computer Organization and Design: The Hardware/Software Interface','David A. Patterson','John L. Hennessy',NULL,NULL,'David A. Patterson','Morgan Kaufmann','Computer Science','Engineering','A1-S2',1,0,'978-0123456790',600,300,'5th','2025-08-12 14:49:09.720589');
INSERT INTO "books" VALUES(3,'B003','Structured Computer Organization','Andrew S. Tanenbaum',NULL,NULL,NULL,'Andrew S. Tanenbaum','Pearson','Information Technology','Engineering','A2-S1',1,1,'978-0123456791',700,450,'6th','2025-08-12 14:49:09.720589');
INSERT INTO "books" VALUES(4,'B004','Operating System Concepts','Abraham Silberschatz','Peter Baer Galvin',NULL,NULL,'Abraham Silberschatz','Wiley','Information Technology','Engineering','A1-S3',1,1,'978-0123456792',833,600,'10th','2025-08-12 14:49:09.730528');
INSERT INTO "books" VALUES(5,'B005','Modern Operating Systems','Andrew S. Tanenbaum','Herbert Bos',NULL,NULL,'Andrew S. Tanenbaum','Pearson','Computer Science','Engineering','A1-S4',1,1,'978-0123456793',958,750,'4th','2025-08-12 14:49:09.730528');
INSERT INTO "books" VALUES(6,'B006','The Art of Computer Programming (Vol. 1–4)','Donald E. Knuth',NULL,NULL,NULL,'Donald E. Knuth','Addison-Wesley','Computer Science','Engineering','A2-S2',1,1,'978-0123456794',1083,900,'3rd','2025-08-12 14:49:09.730528');
INSERT INTO "books" VALUES(7,'B007','Computer Architecture: A Quantitative Approach','John L. Hennessy','David A. Patterson',NULL,NULL,'John L. Hennessy','Morgan Kaufmann','Information Technology','Engineering','A1-S5',1,1,'978-0123456795',1208,1050,'6th','2025-08-12 14:49:09.730528');
INSERT INTO "books" VALUES(8,'B008','Digital Design','M. Morris Mano',NULL,NULL,NULL,'M. Morris Mano','Pearson','Information Technology','Engineering','A1-S6',1,1,'978-0123456796',1333,1200,'6th','2025-08-12 14:49:09.746278');
INSERT INTO "books" VALUES(9,'B009','Computer Networks','Andrew S. Tanenbaum','David J. Wetherall',NULL,NULL,'Andrew S. Tanenbaum','Pearson','Computer Science','Engineering','A2-S3',1,1,'978-0123456797',1458,1350,'6th','2025-08-12 14:49:09.746278');
INSERT INTO "books" VALUES(10,'B010','Data and Computer Communications','William Stallings',NULL,NULL,NULL,'William Stallings','Pearson','Computer Science','Engineering','A1-S7',1,0,'978-0123456798',1583,1500,'10th','2025-08-12 14:49:09.746278');
INSERT INTO "books" VALUES(11,'B011','Clean Code: A Handbook of Agile Software Craftsmanship','Robert C. Martin',NULL,NULL,NULL,'Robert C. Martin','Prentice Hall','Information Technology','Engineering','A1-S8',1,1,'978-0123456799',1708,1650,'1st','2025-08-12 14:49:09.756339');
INSERT INTO "books" VALUES(12,'B012','Code Complete','Steve McConnell',NULL,NULL,NULL,'Steve McConnell','Microsoft Press','Information Technology','Engineering','A2-S4',1,1,'978-0123456800',1833,1800,'2nd','2025-08-12 14:49:09.756339');
INSERT INTO "books" VALUES(13,'B013','The Pragmatic Programmer','Andrew Hunt','David Thomas',NULL,NULL,'Andrew Hunt','Addison-Wesley','Computer Science','Engineering','A1-S9',1,1,'978-0123456801',1958,1950,'2nd','2025-08-12 14:49:09.763263');
INSERT INTO "books" VALUES(14,'B014','Design Patterns: Elements of Reusable Object-Oriented Software','Erich Gamma','Richard Helm',NULL,NULL,'Erich Gamma','Addison-Wesley','Computer Science','Engineering','A1-S10',1,1,'978-0123456802',2083,2100,'1st','2025-08-12 14:49:09.763263');
INSERT INTO "books" VALUES(15,'B015','Refactoring: Improving the Design of Existing Code','Martin Fowler',NULL,NULL,NULL,'Martin Fowler','Addison-Wesley','Information Technology','Engineering','A2-S5',1,1,'978-0123456803',2208,2250,'2nd','2025-08-12 14:49:09.763263');
INSERT INTO "books" VALUES(16,'B016','Effective Java','Joshua Bloch',NULL,NULL,NULL,'Joshua Bloch','Addison-Wesley','Information Technology','Engineering','A1-S11',1,1,'978-0123456804',2333,2400,'3rd','2025-08-12 14:49:09.763263');
INSERT INTO "books" VALUES(17,'B017','C Programming Language','Brian W. Kernighan','Dennis M. Ritchie',NULL,NULL,'Brian W. Kernighan','Prentice Hall','Computer Science','Engineering','A1-S12',1,1,'978-0123456805',2458,2550,'2nd','2025-08-12 14:49:09.763263');
INSERT INTO "books" VALUES(18,'B018','Python Crash Course','Eric Matthes',NULL,NULL,NULL,'Eric Matthes','No Starch Press','Computer Science','Engineering','A2-S6',1,1,'978-0123456806',2583,2700,'2nd','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(19,'B019','Head First Java','Kathy Sierra','Bert Bates',NULL,NULL,'Kathy Sierra','O''Reilly Media','Information Technology','Engineering','A1-S13',1,1,'978-0123456807',2708,2850,'2nd','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(20,'B020','Programming Pearls','Jon Bentley',NULL,NULL,NULL,'Jon Bentley','Addison-Wesley','Information Technology','Engineering','A1-S14',1,1,'978-0123456808',2833,3000,'2nd','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(21,'B021','Algorithms','Robert Sedgewick','Kevin Wayne',NULL,NULL,'Robert Sedgewick','Addison-Wesley','Computer Science','Engineering','A2-S7',1,1,'978-0123456809',2958,3150,'4th','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(22,'B022','Introduction to Algorithms','Thomas H. Cormen','Charles E. Leiserson',NULL,NULL,'Thomas H. Cormen','MIT Press','Computer Science','Engineering','A1-S15',1,1,'978-0123456810',3083,3300,'3rd','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(23,'B023','Grokking Algorithms','Aditya Bhargava',NULL,NULL,NULL,'Aditya Bhargava','Manning Publications','Information Technology','Engineering','A1-S16',1,1,'978-0123456811',3208,3450,'1st','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(24,'B024','Database System Concepts','Abraham Silberschatz','Henry F. Korth',NULL,NULL,'Abraham Silberschatz','McGraw-Hill','Information Technology','Engineering','A2-S8',1,0,'978-0123456812',3333,3600,'7th','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(25,'B025','Fundamentals of Database Systems','Ramez Elmasri','Shamkant Navathe',NULL,NULL,'Ramez Elmasri','Pearson','Computer Science','Engineering','A1-S17',1,1,'978-0123456813',3458,3750,'7th','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(26,'B026','Data Structures and Algorithm Analysis in C++','Mark Allen Weiss',NULL,NULL,NULL,'Mark Allen Weiss','Pearson','Computer Science','Engineering','A1-S18',1,0,'978-0123456814',3583,3900,'4th','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(27,'B027','The Algorithm Design Manual','Steven S. Skiena',NULL,NULL,NULL,'Steven S. Skiena','Springer','Information Technology','Engineering','A2-S9',1,1,'978-0123456815',3708,4050,'2nd','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(28,'B028','Advanced Database Systems','Carlo Zaniolo',NULL,NULL,NULL,'Carlo Zaniolo','Morgan Kaufmann','Information Technology','Engineering','A1-S19',1,1,'978-0123456816',3833,4200,'1st','2025-08-12 14:49:09.780177');
INSERT INTO "books" VALUES(29,'B029','Artificial Intelligence: A Modern Approach','Stuart Russell','Peter Norvig',NULL,NULL,'Stuart Russell','Pearson','Computer Science','Engineering','A1-S20',1,1,'978-0123456817',3958,4350,'4th','2025-08-12 14:49:09.796381');
INSERT INTO "books" VALUES(30,'B030','Pattern Recognition and Machine Learning','Christopher M. Bishop',NULL,NULL,NULL,'Christopher M. Bishop','Springer','Computer Science','Engineering','A2-S10',1,1,'978-0123456818',4083,4500,'1st','2025-08-12 14:49:09.796381');
INSERT INTO "books" VALUES(31,'B031','Deep Learning','Ian Goodfellow','Yoshua Bengio',NULL,NULL,'Ian Goodfellow','MIT Press','Information Technology','Engineering','A1-S21',1,1,'978-0123456819',4208,4650,'1st','2025-08-12 14:49:09.796381');
INSERT INTO "books" VALUES(32,'B032','Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow','Aurélien Géron',NULL,NULL,NULL,'Aurélien Géron','O''Reilly Media','Information Technology','Engineering','A1-S22',1,1,'978-0123456820',4333,4800,'2nd','2025-08-12 14:49:09.796381');
INSERT INTO "books" VALUES(33,'B033','Speech and Language Processing','Daniel Jurafsky','James H. Martin',NULL,NULL,'Daniel Jurafsky','Pearson','Computer Science','Engineering','A2-S11',1,1,'978-0123456821',4458,4950,'3rd','2025-08-12 14:49:09.796381');
INSERT INTO "books" VALUES(34,'B034','Data Science from Scratch','Joel Grus',NULL,NULL,NULL,'Joel Grus','O''Reilly Media','Computer Science','Engineering','A1-S23',1,1,'978-0123456822',4583,5100,'2nd','2025-08-12 14:49:09.796381');
INSERT INTO "books" VALUES(35,'B035','Machine Learning: A Probabilistic Perspective','Kevin P. Murphy',NULL,NULL,NULL,'Kevin P. Murphy','MIT Press','Information Technology','Engineering','A1-S24',1,1,'978-0123456823',4708,5250,'1st','2025-08-12 14:49:09.806323');
INSERT INTO "books" VALUES(36,'B036','Computer Security: Principles and Practice','William Stallings','Lawrie Brown',NULL,NULL,'William Stallings','Pearson','Information Technology','Engineering','A2-S12',1,1,'978-0123456824',4833,5400,'4th','2025-08-12 14:49:09.806323');
INSERT INTO "books" VALUES(37,'B037','Security Engineering','Ross J. Anderson',NULL,NULL,NULL,'Ross J. Anderson','Wiley','Computer Science','Engineering','A1-S25',1,1,'978-0123456825',4958,5550,'3rd','2025-08-12 14:49:09.806323');
INSERT INTO "books" VALUES(38,'B038','Cryptography and Network Security','William Stallings',NULL,NULL,NULL,'William Stallings','Pearson','Computer Science','Engineering','A1-S26',1,1,'978-0123456826',5083,5700,'7th','2025-08-12 14:49:09.812488');
INSERT INTO "books" VALUES(39,'B039','Blockchain Basics','Daniel Drescher',NULL,NULL,NULL,'Daniel Drescher','Apress','Information Technology','Engineering','A2-S13',1,1,'978-0123456827',5208,5850,'1st','2025-08-12 14:49:09.814748');
INSERT INTO "books" VALUES(40,'B040','The Web Application Hacker’s Handbook','Dafydd Stuttard','Marcus Pinto',NULL,NULL,'Dafydd Stuttard','Wiley','Information Technology','Engineering','A1-S27',1,1,'978-0123456828',5333,6000,'2nd','2025-08-12 14:49:09.814748');
INSERT INTO "books" VALUES(41,'B041','Parallel Programming in C with MPI and OpenMP','Michael J. Quinn',NULL,NULL,NULL,'Michael J. Quinn','McGraw-Hill','Computer Science','Engineering','A1-S28',1,1,'978-0123456829',5458,6150,'1st','2025-08-12 14:49:09.814748');
INSERT INTO "books" VALUES(42,'B042','Cloud Computing: Concepts, Technology & Architecture','Thomas Erl',NULL,NULL,NULL,'Thomas Erl','Prentice Hall','Computer Science','Engineering','A2-S14',1,1,'978-0123456830',5583,6300,'1st','2025-08-12 14:49:09.814748');
INSERT INTO "books" VALUES(43,'B043','Distributed Systems: Concepts and Design','George Coulouris','Jean Dollimore',NULL,NULL,'George Coulouris','Pearson','Information Technology','Engineering','A1-S29',1,0,'978-0123456831',5708,6450,'5th','2025-08-12 14:49:09.814748');
INSERT INTO "books" VALUES(44,'B044','Human–Computer Interaction','Alan Dix','Janet Finlay',NULL,NULL,'Alan Dix','Pearson','Information Technology','Engineering','A1-S30',1,1,'978-0123456832',5833,6600,'3rd','2025-08-12 14:49:09.814748');
INSERT INTO "books" VALUES(45,'B045','Computer Graphics: Principles and Practice','John F. Hughes','Andries van Dam',NULL,NULL,'John F. Hughes','Addison-Wesley','Computer Science','Engineering','A2-S15',1,1,'978-0123456833',5958,6750,'3rd','2025-08-12 14:49:09.814748');
CREATE TABLE categories (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	description TEXT, 
	created_at DATETIME, 
	created_by INTEGER, 
	PRIMARY KEY (id), 
	UNIQUE (name), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
INSERT INTO "categories" VALUES(1,'Engineering',NULL,'2025-07-23 02:37:15.301110',1);
CREATE TABLE circulations (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	book_id INTEGER NOT NULL, 
	issue_date DATETIME, 
	due_date DATETIME NOT NULL, 
	return_date DATETIME, 
	status VARCHAR(20), 
	fine_amount FLOAT, 
	renewal_count INTEGER, 
	max_renewals INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(book_id) REFERENCES books (id)
);
INSERT INTO "circulations" VALUES(1,86,3,'2025-08-12 16:24:45.562546','2025-08-26 16:34:09.491167','2025-08-12 17:11:51.374783','returned',0.0,1,2);
INSERT INTO "circulations" VALUES(2,68,29,'2025-08-12 16:25:10.335490','2025-08-13 00:00:00.000000','2025-08-21 08:52:39.543966','returned',8.0,0,2);
INSERT INTO "circulations" VALUES(3,120,26,'2025-08-12 16:25:27.166655','2025-08-14 00:00:00.000000',NULL,'overdue',0.0,0,2);
INSERT INTO "circulations" VALUES(4,120,43,'2025-08-12 16:25:40.232120','2025-08-13 00:00:00.000000',NULL,'overdue',0.0,0,2);
INSERT INTO "circulations" VALUES(5,119,10,'2025-08-12 16:26:00.886816','2025-08-13 00:00:00.000000',NULL,'overdue',0.0,0,2);
INSERT INTO "circulations" VALUES(6,86,2,'2025-08-12 16:36:19.094895','2025-08-26 22:06:19.035574',NULL,'overdue',0.0,0,2);
INSERT INTO "circulations" VALUES(7,86,24,'2025-08-12 16:37:05.569519','2025-08-13 00:00:00.000000',NULL,'overdue',0.0,0,2);
INSERT INTO "circulations" VALUES(8,66,3,'2025-08-21 08:59:03.156467','2025-09-04 00:00:00.000000','2025-08-21 09:00:07.444817','returned',0.0,0,2);
INSERT INTO "circulations" VALUES(9,66,1,'2025-08-21 08:59:15.494353','2025-09-04 00:00:00.000000','2025-08-21 09:00:07.456806','returned',0.0,0,2);
INSERT INTO "circulations" VALUES(10,66,5,'2025-08-21 08:59:23.646546','2025-09-04 00:00:00.000000','2025-08-21 09:00:07.464803','returned',0.0,0,2);
CREATE TABLE colleges (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	code VARCHAR(10) NOT NULL, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (name), 
	UNIQUE (code)
);
INSERT INTO "colleges" VALUES(1,'Excel Engineering college','eec','2025-07-23 02:36:06.403518');
CREATE TABLE departments (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	code VARCHAR(10) NOT NULL, 
	college_id INTEGER NOT NULL, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (name, college_id), 
	FOREIGN KEY(college_id) REFERENCES colleges (id)
);
INSERT INTO "departments" VALUES(1,'computer science and engineering','cse',1,'2025-07-23 02:36:39.201425');
CREATE TABLE ebooks (
	id INTEGER NOT NULL, 
	access_no VARCHAR(50) NOT NULL, 
	website VARCHAR(500) NOT NULL, 
	web_detail TEXT, 
	web_title VARCHAR(300) NOT NULL, 
	subject VARCHAR(200) NOT NULL, 
	type VARCHAR(50) NOT NULL, 
	download_count INTEGER, 
	created_by INTEGER NOT NULL, 
	created_at DATETIME, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (access_no), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
INSERT INTO "ebooks" VALUES(1,'E1','https://ragavan2104.github.io/nostra/','jefbwc niwoef nj raagvan adbwjj m manihj','hlo','Aeronautical Engineering','E-journal',0,1,'2025-09-02 04:51:53.361621','2025-09-02 04:51:53.361621');
CREATE TABLE fines (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	circulation_id INTEGER, 
	amount FLOAT NOT NULL, 
	reason VARCHAR(200) NOT NULL, 
	status VARCHAR(20), 
	created_date DATETIME, 
	paid_date DATETIME, 
	created_by INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(circulation_id) REFERENCES circulations (id), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
INSERT INTO "fines" VALUES(1,120,3,7.0,'Overdue fine for "Data Structures and Algorithm Analysis in C++" (B026) - 7 days late','pending','2025-08-21T14:01:33.980812',NULL,1);
INSERT INTO "fines" VALUES(2,120,4,8.0,'Overdue fine for "Distributed Systems: Concepts and Design" (B043) - 8 days late','pending','2025-08-21T14:01:33.982814',NULL,1);
INSERT INTO "fines" VALUES(3,119,5,8.0,'Overdue fine for "Data and Computer Communications" (B010) - 8 days late','pending','2025-08-21T14:01:33.982814',NULL,1);
INSERT INTO "fines" VALUES(4,86,7,8.0,'Overdue fine for "Database System Concepts" (B024) - 8 days late','pending','2025-08-21T14:01:33.983819',NULL,1);
INSERT INTO "fines" VALUES(5,68,2,8.0,'Overdue fine for book: Artificial Intelligence: A Modern Approach','pending','2025-08-21 08:52:39.571480',NULL,1);
INSERT INTO "fines" VALUES(6,86,6,7.0,'Overdue fine for "Computer Organization and Design: The Hardware/Software Interface" (B002) - 7 days late','pending','2025-09-02 04:17:51.203293',NULL,1);
CREATE TABLE gate_entry_credentials (
	id INTEGER NOT NULL, 
	username VARCHAR(100) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	name VARCHAR(200) NOT NULL, 
	is_active BOOLEAN, 
	created_date DATETIME, 
	created_by INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (username), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
INSERT INTO "gate_entry_credentials" VALUES(1,'0000','scrypt:32768:8:1$LHyvWJLBy7loPVYS$0775bbd627bb5512e5c40f19f3a3f3b89ac61cda020c7ddc340903c873422e0ef7d0f260d1fa59ea36c8ec2d3dc2f0cfdde98558fa818046625bc31012fa86b9','Ragavan',1,'2025-09-02 04:53:56.872687',194);
CREATE TABLE gate_entry_logs (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	entry_time DATETIME, 
	exit_time DATETIME, 
	status VARCHAR(20), 
	scanned_by INTEGER NOT NULL, 
	created_date DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(scanned_by) REFERENCES gate_entry_credentials (id)
);
INSERT INTO "gate_entry_logs" VALUES(1,119,'2025-09-02 14:02:32.889791','2025-09-02 14:02:39.555038','out',1,'2025-09-02 14:02:32.895805');
INSERT INTO "gate_entry_logs" VALUES(2,66,'2025-09-02 14:03:08.345295','2025-09-02 14:03:14.158861','out',1,'2025-09-02 14:03:08.346287');
CREATE TABLE news_clippings (
	id INTEGER NOT NULL, 
	clipping_no VARCHAR(50) NOT NULL, 
	newspaper_name VARCHAR(200) NOT NULL, 
	news_type VARCHAR(100) NOT NULL, 
	date DATE NOT NULL, 
	pages VARCHAR(50) NOT NULL, 
	news_title VARCHAR(300) NOT NULL, 
	news_subject VARCHAR(200) NOT NULL, 
	keywords VARCHAR(500) NOT NULL, 
	pdf_file_name VARCHAR(255) NOT NULL, 
	pdf_file_path VARCHAR(500) NOT NULL, 
	pdf_file_size VARCHAR(20), 
	abstract TEXT, 
	content TEXT, 
	download_count INTEGER, 
	created_by INTEGER NOT NULL, 
	created_at DATETIME, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (clipping_no), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
CREATE TABLE question_banks (
	id INTEGER NOT NULL, 
	college_id INTEGER NOT NULL, 
	department_id INTEGER NOT NULL, 
	subject_name VARCHAR(200) NOT NULL, 
	subject_code VARCHAR(50) NOT NULL, 
	regulation VARCHAR(100), 
	file_path VARCHAR(500) NOT NULL, 
	file_name VARCHAR(200) NOT NULL, 
	file_size VARCHAR(20), 
	download_count INTEGER, 
	uploaded_by INTEGER NOT NULL, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(college_id) REFERENCES colleges (id), 
	FOREIGN KEY(department_id) REFERENCES departments (id), 
	FOREIGN KEY(uploaded_by) REFERENCES users (id)
);
CREATE TABLE reservations (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	book_id INTEGER NOT NULL, 
	reservation_date DATETIME, 
	expiry_date DATETIME NOT NULL, 
	notification_date DATETIME, 
	pickup_deadline DATETIME, 
	status VARCHAR(20), 
	queue_position INTEGER, 
	notes TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(book_id) REFERENCES books (id)
);
INSERT INTO "reservations" VALUES(1,86,2,'2025-08-12 16:35:27.852700','2025-09-11 16:35:27.852700',NULL,'2025-08-13 00:00:00.000000','fulfilled',1,'i will get it tommorow');
CREATE TABLE settings (
	id INTEGER NOT NULL, 
	"key" VARCHAR(100) NOT NULL, 
	value VARCHAR(500) NOT NULL, 
	description TEXT, 
	created_at DATETIME, 
	updated_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE ("key")
);
INSERT INTO "settings" VALUES(1,'max_books_per_student','3','Maximum number of books a student can borrow at once','2025-07-31 02:25:13.788954','2025-08-21 08:57:42.770157');
INSERT INTO "settings" VALUES(2,'max_books_per_staff','5','Maximum number of books a staff member can borrow at once','2025-07-31 02:25:13.797550','2025-08-21 08:57:42.737159');
INSERT INTO "settings" VALUES(3,'loan_period_days','14','Default loan period in days','2025-07-31 02:25:13.803898','2025-08-21 08:57:42.723159');
INSERT INTO "settings" VALUES(4,'daily_fine_rate','1','Daily fine rate for overdue books','2025-07-31 02:25:13.808903','2025-08-21 08:57:42.656814');
INSERT INTO "settings" VALUES(5,'max_renewal_count','2','Maximum number of times a book can be renewed','2025-07-31 02:25:13.815112','2025-08-21 08:57:42.784154');
INSERT INTO "settings" VALUES(6,'renewal_period_days','7','Number of days added when a book is renewed','2025-07-31 02:25:13.820647','2025-08-21 08:57:42.809159');
INSERT INTO "settings" VALUES(7,'overdue_grace_period','0','Grace period in days before fines are applied','2025-07-31 02:25:13.826125','2025-08-21 08:57:42.796153');
CREATE TABLE "thesis" (
            id INTEGER NOT NULL,
            thesis_number VARCHAR(50) NOT NULL,
            author VARCHAR(200) NOT NULL,
            project_guide VARCHAR(200) NOT NULL,
            title VARCHAR(300) NOT NULL,
            college_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            type VARCHAR(50) NOT NULL,
            pdf_file_name VARCHAR(255) NOT NULL,
            pdf_file_path VARCHAR(500) NOT NULL,
            pdf_file_size VARCHAR(20),
            download_count INTEGER DEFAULT 0,
            created_by INTEGER NOT NULL,
            created_at DATETIME,
            updated_at DATETIME,
            PRIMARY KEY (id),
            UNIQUE (thesis_number),
            FOREIGN KEY(college_id) REFERENCES colleges (id),
            FOREIGN KEY(department_id) REFERENCES departments (id),
            FOREIGN KEY(created_by) REFERENCES users (id)
        );
CREATE TABLE users (
	id INTEGER NOT NULL, 
	user_id VARCHAR(50) NOT NULL, 
	username VARCHAR(80) NOT NULL, 
	password_hash VARCHAR(120) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	email VARCHAR(120) NOT NULL, 
	role VARCHAR(20) NOT NULL, 
	user_role VARCHAR(20), 
	designation VARCHAR(50) NOT NULL, 
	dob DATE NOT NULL, 
	validity_date DATE NOT NULL, 
	college_id INTEGER, 
	department_id INTEGER, 
	is_active BOOLEAN, 
	created_at DATETIME, batch_from INTEGER, batch_to INTEGER, first_login_completed BOOLEAN DEFAULT 0, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	UNIQUE (username), 
	UNIQUE (email), 
	FOREIGN KEY(college_id) REFERENCES colleges (id), 
	FOREIGN KEY(department_id) REFERENCES departments (id)
);
INSERT INTO "users" VALUES(1,'ADMIN001','admin','scrypt:32768:8:1$RYUXnkZReuH0uVgu$87abcf6b4632aa07d205f70e6b3313f02dcf706930247e7438d2f0b4301c3466a7ca27dae7009b054112c58d50a0c5ab8ee8bd15a71b9eb5925cb18c7d8bc052','System Administrator','admin@library.com','admin','student','System Administrator','1980-01-01','2030-12-31',NULL,NULL,1,'2025-07-23 02:33:08.223374',NULL,NULL,1);
INSERT INTO "users" VALUES(2,'22CS001','abhishekkumaryadav841101@gmail.com','pbkdf2:sha256:600000$c0ivx6iHO4IQ3VZq$5d30ad26091e643a913662c81f8949489cd5bf23df21069721d746b7a7be2e2d','ABHISHEK KUMAR','abhishekkumaryadav841101@gmail.com','student','student','student','2005-08-21','2026-08-12',1,1,1,'2025-08-12 16:22:04.573072',2022,2026,0);
INSERT INTO "users" VALUES(3,'22CS002','abhishekt20041234@gmail.com','pbkdf2:sha256:600000$Bdg0JegM2c24kcPe$fdd343b649cfa7d2b123e274d09fb92e0367b806f9c3804a8f08a9ea84367c1c','ABHISHEK T','abhishekt20041234@gmail.com','student','student','student','2004-07-07','2026-08-12',1,1,1,'2025-08-12 16:22:04.906285',2022,2026,0);
INSERT INTO "users" VALUES(4,'22CS003','abinayanila2004@gmail.com','pbkdf2:sha256:600000$2Omi63uoYlxC3Du1$2ad479a78495f092e3c28e169ff7aa248f3300c5fdfb26d7e5b4dd20bfccb985','ABINAYA D','abinayanila2004@gmail.com','student','student','student','2004-11-25','2026-08-12',1,1,1,'2025-08-12 16:22:05.251480',2022,2026,0);
INSERT INTO "users" VALUES(5,'22CS004','manikkoth878@gmail.com','pbkdf2:sha256:600000$1krt89LxSLLtfmYk$ecea4ad69ea282c37dca21493164b43f31ac8fdb68287b8de5ae8f60ac3af984','ADARSH M','manikkoth878@gmail.com','student','student','student','2004-11-06','2026-08-12',1,1,1,'2025-08-12 16:22:05.635595',2022,2026,0);
INSERT INTO "users" VALUES(6,'22CS005','amalkeloth2004@gmail.com','pbkdf2:sha256:600000$Htx6cih2bX1KwynL$dee9c8c7d715a5a2b016afe51c3a2801c3144ecacdfbd58a0e33cd6ae97a0b1b','AMAL K','amalkeloth2004@gmail.com','student','student','student','2004-07-08','2026-08-12',1,1,1,'2025-08-12 16:22:05.898559',2022,2026,0);
INSERT INTO "users" VALUES(7,'22cs006','anandu.kriishna@gmail.com','pbkdf2:sha256:600000$kAooDnwfrI1is787$cf2f00e07982ac909e5c312f9b9b90f0d2a29c24709412b32c50d4a31220725d','ANANDUKRISHNA V P','anandu.kriishna@gmail.com','student','student','student','2003-07-30','2026-08-12',1,1,1,'2025-08-12 16:22:06.223914',2022,2026,0);
INSERT INTO "users" VALUES(8,'22CS007','anfasmohasin@gmail.com','pbkdf2:sha256:600000$vtFQmWEbhHEKtdF4$52dcd5bd11ef865e00f0d6dee4c5ccb00279d9ce5b61b374ff7b71bf483a975b','ANFAS MOHASIN C P','anfasmohasin@gmail.com','student','student','student','2004-03-17','2026-08-12',1,1,1,'2025-08-12 16:22:06.524802',2022,2026,0);
INSERT INTO "users" VALUES(9,'22cs008','amanraj766756@gmail.com','pbkdf2:sha256:600000$HHKPyarpc1vXFDAK$6ba9bad054f4326583177e8aba965076a4630fdbcaea69758a39fdd90a5ba815','ANKIT RAJ','amanraj766756@gmail.com','student','student','student','2004-03-29','2026-08-12',1,1,1,'2025-08-12 16:22:06.820858',2022,2026,0);
INSERT INTO "users" VALUES(10,'22CS009','anujkumar83401313@gmail.com','pbkdf2:sha256:600000$2UUlTdayNZYOz7I5$9c6d0e818dd184e6a4df2802ee2c9ea743cd52eb564a92c13fbd44db249247e6','ANUJ KUMAR','anujkumar83401313@gmail.com','student','student','student','2005-12-03','2026-08-12',1,1,1,'2025-08-12 16:22:07.114013',2022,2026,0);
INSERT INTO "users" VALUES(11,'22cs011','arul36336@gmail.com','pbkdf2:sha256:600000$VT7E3oDVAxwXc0ih$0c28b1a68a1552eeec902406b48ad5ea63956b6b4acb868f7b30ee2e35487208','ARULKUMAR M','arul36336@gmail.com','student','student','student','2004-11-12','2026-08-12',1,1,1,'2025-08-12 16:22:07.367974',2022,2026,0);
INSERT INTO "users" VALUES(12,'22cs012','salmanbabu048@gmail.com','pbkdf2:sha256:600000$TtPvXVyjIV4Lj86x$51566e250e1332e5c6b2ad5020a74e22f787050835a0d101ef43e11b03bdf341','ARULALAN.M','salmanbabu048@gmail.com','student','student','student','2004-11-11','2026-08-12',1,1,1,'2025-08-12 16:22:07.668555',2022,2026,0);
INSERT INTO "users" VALUES(13,'22CS013','shaaasha55@gmail.com','pbkdf2:sha256:600000$5rGe46szo74a4sdO$90b1a489ce796928ddfd806e5510b240503900e20bcb78f57ec47f8e334fa72f','ASHA BENASHIR A','shaaasha55@gmail.com','student','student','student','2005-12-21','2026-08-12',1,1,1,'2025-08-12 16:22:07.994121',2022,2026,0);
INSERT INTO "users" VALUES(14,'22CS014','ashutoshkmr2005@gmail.com','pbkdf2:sha256:600000$S7mWAyJMaVuA6d7v$4ab1b8261a190d3e5dd3e8055d3c610fc05c27c7cb5983b9699cdb9205a35b7a','ASHUTOSH KUMAR','ashutoshkmr2005@gmail.com','student','student','student','2005-08-18','2026-08-12',1,1,1,'2025-08-12 16:22:08.279597',2022,2026,0);
INSERT INTO "users" VALUES(15,'22CS015','aashwina770@gmail.com','pbkdf2:sha256:600000$28DQNTYJx3wd7eEJ$0ba30d32b71e57f1396a6317cc6d8457fe1a13ae32f5b3abaef97508a48c7cab','ASHWINA K','aashwina770@gmail.com','student','student','student','2005-06-18','2026-08-12',1,1,1,'2025-08-12 16:22:08.566746',2022,2026,0);
INSERT INTO "users" VALUES(16,'22CS016','aswanthrakesh431@gmail.com','pbkdf2:sha256:600000$ZXXc00T1VmO13qdR$f70de6e257fe4a7d4c3ab072834e670e7735e098cdf8b8696766e968902928f8','ASWANTH RAKESH M','aswanthrakesh431@gmail.com','student','student','student','2005-02-17','2026-08-12',1,1,1,'2025-08-12 16:22:08.868251',2022,2026,0);
INSERT INTO "users" VALUES(17,'22CS017','ashwinsundar90250@gmail.com','pbkdf2:sha256:600000$nOQBqy5UYvrUhjZO$80e0197d0767fc8142f52b1d87b27a66318f13ce7446cbf1d25484ab9e37b575','ASHWIN SUNDAR V.S','ashwinsundar90250@gmail.com','student','student','student','2005-08-06','2026-08-12',1,1,1,'2025-08-12 16:22:09.189663',2022,2026,0);
INSERT INTO "users" VALUES(18,'22CS018','balajidolu@gmail.com','pbkdf2:sha256:600000$roOcYWBfd9GLLMGR$5cd39cdb929bb976371966fbfd6750b37d1ee6e69483935996cf0cba79567efa','BALAJI J','balajidolu@gmail.com','student','student','student','2004-11-08','2026-08-12',1,1,1,'2025-08-12 16:22:09.472043',2022,2026,0);
INSERT INTO "users" VALUES(19,'22CS019','jayambarani27@gmail.com','pbkdf2:sha256:600000$cwZk8vkziuEQzH0i$e3fcc6a22249089188dc3eca4b9860477a5669057651a1b7a86894dca8a8ecdb','BARANI A','jayambarani27@gmail.com','student','student','student','2004-11-25','2026-08-12',1,1,1,'2025-08-12 16:22:09.770265',2022,2026,0);
INSERT INTO "users" VALUES(20,'22cs020','barathsri25@gmail.com','pbkdf2:sha256:600000$Rb4Q92m6gKh7ulrZ$7ce4cbc453fc9ccd2f818c4e9bf7883a5b4e190763cd118f0ffc0788455108bb','BARATH SRI R','barathsri25@gmail.com','student','student','student','2005-04-04','2026-08-12',1,1,1,'2025-08-12 16:22:10.092897',2022,2026,0);
INSERT INTO "users" VALUES(21,'22CS021','bharathm8072@gmail.com','pbkdf2:sha256:600000$h6U3eSOrLakanfQI$baba9ea6b0594a8c86cf722bb9c20e953170b6450b198214ef31e91e7b3c2628','BHARATH M','bharathm8072@gmail.com','student','student','student','2005-07-06','2026-08-12',1,1,1,'2025-08-12 16:22:10.378382',2022,2026,0);
INSERT INTO "users" VALUES(22,'22CS022','bharatmukhiya605@gmail.com','pbkdf2:sha256:600000$aYC4GuKlP6AZU8MM$f54f89334bf20b52fbbbb4d1d7a54326d286b81b44c779f9415441d2359fe67b','BIBEK KUMAR ','bharatmukhiya605@gmail.com','student','student','student','2005-06-03','2026-08-12',1,1,1,'2025-08-12 16:22:10.680257',2022,2026,0);
INSERT INTO "users" VALUES(23,'22cs023','boopathia3549@gmail.com','pbkdf2:sha256:600000$SuJcFVfcs5QfHryD$e931dac9cc38905ceaa2a0068aaea343b12843cf54746724359cc7de933226a0','BOOPATHI A','boopathia3549@gmail.com','student','student','student','2005-03-26','2026-08-12',1,1,1,'2025-08-12 16:22:10.960846',2022,2026,0);
INSERT INTO "users" VALUES(24,'22CS024','Charan33317@gmail.com','pbkdf2:sha256:600000$5RXkJHXHZjeGVr29$45894822184770e8756899082568881e6cfd95ff25f24f0d07ca98685ce90eee','CHARAN TEJA K M','Charan33317@gmail.com','student','student','student','2005-04-27','2026-08-12',1,1,1,'2025-08-12 16:22:11.273961',2022,2026,0);
INSERT INTO "users" VALUES(25,'22CS025','darsinir004@gmail.com','pbkdf2:sha256:600000$agyYa61yh73bn7WI$f80b673b6f75fb469b561ef34a1e92b16be721fb58ea512aff897efe1d038189','DARSINI R','darsinir004@gmail.com','student','student','student','2004-09-23','2026-08-12',1,1,1,'2025-08-12 16:22:11.570541',2022,2026,0);
INSERT INTO "users" VALUES(26,'22CS026','tdeena2004@gmail.com','pbkdf2:sha256:600000$ADNx3S1Br2r8Iy6N$a54d0cd1f9374576e79be939384497b61dba51b8cf19b69af824aae736710275','DEENA.T','tdeena2004@gmail.com','student','student','student','2004-03-20','2026-08-12',1,1,1,'2025-08-12 16:22:11.887679',2022,2026,0);
INSERT INTO "users" VALUES(27,'22CS027','devanandup2004@gmail.com','pbkdf2:sha256:600000$H6fMXbhOqHpSbj2v$c3a923fde29fe52ef589eea0db73d048ba9cdb7c0a93189a7710d67322c2fa3c','DEVANAND UPADHYAY','devanandup2004@gmail.com','student','student','student','2004-02-18','2026-08-12',1,1,1,'2025-08-12 16:22:12.141227',2022,2026,0);
INSERT INTO "users" VALUES(28,'22cs028','kdevnandankumar39@gmail.com','pbkdf2:sha256:600000$Yloh8fC4tQGt1dxB$383c74d8f087920eaea8735abbd531980c90625db229383834ad6460f5ce8022','DEVNANDAN KUMAR','kdevnandankumar39@gmail.com','student','student','student','2004-05-08','2026-08-12',1,1,1,'2025-08-12 16:22:12.449670',2022,2026,0);
INSERT INTO "users" VALUES(29,'22CS029','dhanus6851@gmail.com','pbkdf2:sha256:600000$P4b96xCUVbHsflPk$e478dc565bc92f7491ca510793a9ed27d81ff864387b2ade304a8efd4ba01928','DHANUSH D','dhanus6851@gmail.com','student','student','student','2005-02-06','2026-08-12',1,1,1,'2025-08-12 16:22:12.708626',2022,2026,0);
INSERT INTO "users" VALUES(30,'22CS030','dharani.baskarana@gmail.com','pbkdf2:sha256:600000$QCqKY45587v0lNVn$d44ce19db238caad44e9a616409cc7f79b4bb6a65b9f005741cb3d631e8d893e','DHARANI B','dharani.baskarana@gmail.com','student','student','student','2004-08-31','2026-08-12',1,1,1,'2025-08-12 16:22:12.968993',2022,2026,0);
INSERT INTO "users" VALUES(31,'22CS031','dharanishag@gmail.com','pbkdf2:sha256:600000$Oue6hIobtuYDhdeI$89523dd5be411d23880e05b20ec3cbf9517cb24d6476ba5fb7e0bed9ebbdae02','DHARANISHA G','dharanishag@gmail.com','student','student','student','2005-06-27','2026-08-12',1,1,1,'2025-08-12 16:22:13.270439',2022,2026,0);
INSERT INTO "users" VALUES(32,'22CS033','dineshkumar9345542@gmail.com','pbkdf2:sha256:600000$jGGxJf2EWMReCEVg$ca717e51c83f54220c6ede0b8a891bf4ec03a6067e7331412988b62250ffbe00','DINESH A','dineshkumar9345542@gmail.com','student','student','student','2004-09-27','2026-08-12',1,1,1,'2025-08-12 16:22:13.510491',2022,2026,0);
INSERT INTO "users" VALUES(33,'22CS034','dipak10012004@gmail.com','pbkdf2:sha256:600000$oCWT2b3nG9Q2JPZS$3cf3c8ccc5e8ac6b31307f40719290ee20843eeff020d02473c7f4305644f85a','DIPAKKUMAR','dipak10012004@gmail.com','student','student','student','2004-10-01','2026-08-12',1,1,1,'2025-08-12 16:22:13.797978',2022,2026,0);
INSERT INTO "users" VALUES(34,'22CS035','kanistasathiyakumar@gmail.com','pbkdf2:sha256:600000$UfuNDdiNIJBQBUf5$b0725d2e27305e99b3d0c409e792464fa9821973ca230bcfbd7b15ae06f001e6','GANISTA','kanistasathiyakumar@gmail.com','student','student','student','2005-05-17','2026-08-12',1,1,1,'2025-08-12 16:22:14.067569',2022,2026,0);
INSERT INTO "users" VALUES(35,'22CS036','gnanignaneshvar@gmail.com','pbkdf2:sha256:600000$sVfsCoP6PZYYjLya$9c4dcf7bc02eb4c1eeb3a87b34eb7e820a0745ddad424f2098672f79e7f10bf8','GNANESHVAR A','gnanignaneshvar@gmail.com','student','student','student','2004-06-10','2026-08-12',1,1,1,'2025-08-12 16:22:14.322478',2022,2026,0);
INSERT INTO "users" VALUES(36,'22CS037','gokulcse02@gmail.com','pbkdf2:sha256:600000$bVR53YFOCh1B4r7D$9e77d15e42d04eef5705a8139881f2481b5c30ddf0f630b81be7aa6273165265','GOKUL K','gokulcse02@gmail.com','student','student','student','2004-11-30','2026-08-12',1,1,1,'2025-08-12 16:22:14.592506',2022,2026,0);
INSERT INTO "users" VALUES(37,'22cs038','gokulavanisaravanan@gmail.com','pbkdf2:sha256:600000$DlqXHU3SkbQrWH2C$e4d3843627e05fe3cf41485e6f75e2f876cd8c3d267bf1a7d5c30aff825a881f','GOKULAVANI S','gokulavanisaravanan@gmail.com','student','student','student','2005-05-30','2026-08-12',1,1,1,'2025-08-12 16:22:14.894858',2022,2026,0);
INSERT INTO "users" VALUES(38,'22CS039','Gkrisnan51@gmail.com','pbkdf2:sha256:600000$iL6G65wTWNKWdF2S$8979568ec2ce9fd3af39759447a283cee791e94240f46c63d0344091965de53c','GOKULKRISNAN G P','Gkrisnan51@gmail.com','student','student','student','2004-09-26','2026-08-12',1,1,1,'2025-08-12 16:22:15.166129',2022,2026,0);
INSERT INTO "users" VALUES(39,'22CS040','Gopikalatha2004@gmail.com','pbkdf2:sha256:600000$Dt62rIkvOFrx9P1U$511c34b7b3faf21e3227967a9b155694c147db828d5e8f9176bf4aa4dbd2d56a','GOPIKA.K','Gopikalatha2004@gmail.com','student','student','student','2004-12-21','2026-08-12',1,1,1,'2025-08-12 16:22:15.451687',2022,2026,0);
INSERT INTO "users" VALUES(40,'22CS041','rockygowtham123@gmail.com','pbkdf2:sha256:600000$4LxlNnePUewvAn1D$5b03ba7cf7febd753de2c32c02326046b9d67b85698a3008aee56b1bc3de3e20','GOWTHAM M','rockygowtham123@gmail.com','student','student','student','2005-08-25','2026-08-12',1,1,1,'2025-08-12 16:22:15.750584',2022,2026,0);
INSERT INTO "users" VALUES(41,'22CS042','gowthamgowshik500@gmail.com','pbkdf2:sha256:600000$YDw0SIRMEnB3LSyC$65a3260fa067f3d3a87ce181b18e07e6ff3b9e5a16275e85b50684a127eb2f6c','GOWTHAM  P','gowthamgowshik500@gmail.com','student','student','student','2004-11-04','2026-08-12',1,1,1,'2025-08-12 16:22:16.038663',2022,2026,0);
INSERT INTO "users" VALUES(42,'22CS043','kumarsubramani741@gmail.com','pbkdf2:sha256:600000$5SIeVLzj9AACrYHH$a996c57ec69a87ad8a0f406881249c375e1b106f60e6c09dfb5318c7ab631487','GOWTHAM  S','kumarsubramani741@gmail.com','student','student','student','2004-02-12','2026-08-12',1,1,1,'2025-08-12 16:22:16.294034',2022,2026,0);
INSERT INTO "users" VALUES(43,'22CS044','gunaff123@gmail.com','pbkdf2:sha256:600000$uB94goTFvi5lYWoi$96f5f38cc53a986d63ad189944238bb80fa5105726c7bab9a75990715708c206','GUNA N','gunaff123@gmail.com','student','student','student','2004-10-08','2026-08-12',1,1,1,'2025-08-12 16:22:16.596728',2022,2026,0);
INSERT INTO "users" VALUES(44,'22CS045','hariompandit9999@gmail.com','pbkdf2:sha256:600000$Ls6QjXH9p9zawMKT$c9fb3330a553bbfe25b88bf26accabf927b434d9569c4b21c1a4280958417370','HARIOM KUMAR PANDIT','hariompandit9999@gmail.com','student','student','student','2003-03-08','2026-08-12',1,1,1,'2025-08-12 16:22:16.867202',2022,2026,0);
INSERT INTO "users" VALUES(45,'22CS046','hariharan22042005@gmail.com','pbkdf2:sha256:600000$ujyxYTiqdh7iyRj8$33bfddf95befe7c08934be213d1f2bfc173f90c9ce70a76a668a93dd3fef792f','HARIHARAN S','hariharan22042005@gmail.com','student','student','student','2005-04-22','2026-08-12',1,1,1,'2025-08-12 16:22:17.158886',2022,2026,0);
INSERT INTO "users" VALUES(46,'22CS047','hk7448840@gmail.com','pbkdf2:sha256:600000$YMdClnhnOndTj9y8$e849e2f389073053fa41bcc8c76db742542a3ecfe2631d177f9e5a0335fc4da1','HARISH KUMAR  M','hk7448840@gmail.com','student','student','student','2004-12-27','2026-08-12',1,1,1,'2025-08-12 16:22:17.425720',2022,2026,0);
INSERT INTO "users" VALUES(47,'22CS048','hharshavarthini58@gmail.com','pbkdf2:sha256:600000$b9qBV2kOibmlAvi9$a15c00fe919f1947ba2f48deed3e99e0be5391d8eecc7035708c26d7f94fe967','HARSHAVARTHINI  V','hharshavarthini58@gmail.com','student','student','student','2005-06-10','2026-08-12',1,1,1,'2025-08-12 16:22:17.710227',2022,2026,0);
INSERT INTO "users" VALUES(48,'22CS050','himanshu160204@gmail.com','pbkdf2:sha256:600000$iJc6nr6Vhv6HERqu$a8d3a22344ed79dc37909898a5de407d7f50f0a05a91c788d5a8395c87d09c3a','HIMANSHU KUMAR VISHWAKRMA','himanshu160204@gmail.com','student','student','student','2004-02-16','2026-08-12',1,1,1,'2025-08-12 16:22:17.999876',2022,2026,0);
INSERT INTO "users" VALUES(49,'22CS051','Jabeerj393@gmail.com','pbkdf2:sha256:600000$AQqjBjQBl9jlr0ac$132a14ea1a6bd658e7db0cf9be6498639dfe10153cbcd9119931ea6c81c9e38a','JABEER V','Jabeerj393@gmail.com','student','student','student','2004-08-21','2026-08-12',1,1,1,'2025-08-12 16:22:18.285240',2022,2026,0);
INSERT INTO "users" VALUES(50,'22CS052','nawas786@gmail.com','pbkdf2:sha256:600000$FuGitAe2SppXvZ9U$154c67f3f49ab8a053746d9045c60da41c58501ccbaf72654825dbcc8b67f9b8','JAYED KHAN N','nawas786@gmail.com','student','student','student','2005-01-30','2026-08-12',1,1,1,'2025-08-12 16:22:18.568178',2022,2026,0);
INSERT INTO "users" VALUES(51,'22CS053','jeevajeeva73192@gmail.com','pbkdf2:sha256:600000$s2tGwwioBcIJPPrt$97a70e44cf0568ac913a0b4bc2004777c0c195313adb76aeb4ee5ffb5345e43b','JEEVA  A','jeevajeeva73192@gmail.com','student','student','student','2004-10-22','2026-08-12',1,1,1,'2025-08-12 16:22:18.871111',2022,2026,0);
INSERT INTO "users" VALUES(52,'22CS054','kumarjeeva9750@gmail.com','pbkdf2:sha256:600000$RBp7Ua2ytJS5Pc5j$ffd76611860fd0745d6e0ee6047b1ff87bf27533c07a3b97a5e8787dcae66eac','JEEVA  S','kumarjeeva9750@gmail.com','student','student','student','2005-04-04','2026-08-12',1,1,1,'2025-08-12 16:22:19.157595',2022,2026,0);
INSERT INTO "users" VALUES(53,'22CS055','jkajhokopa6@gmail.com','pbkdf2:sha256:600000$BQGPbnae5YoZyt6U$86c8f6ce5c2783d9f900d42978dac11c84b0788b65641726764023b2bf4011ec','JITENDRA KUMAR','jkajhokopa6@gmail.com','student','student','student','2004-10-01','2026-08-12',1,1,1,'2025-08-12 16:22:19.448408',2022,2026,0);
INSERT INTO "users" VALUES(54,'22CS056','kabilankabilan94828@gmail.com','pbkdf2:sha256:600000$iNeVDHz49bN4icBs$f32f6cf65b8ffbda4a31aadc7cb456f94635d2a72852303ad650b5b338680a05','KABILAN B','kabilankabilan94828@gmail.com','student','student','student','2005-04-05','2026-08-12',1,1,1,'2025-08-12 16:22:19.765968',2022,2026,0);
INSERT INTO "users" VALUES(55,'22CS057','07kalpanap@gmail.com','pbkdf2:sha256:600000$EX1htskSfthXPKBA$e6a4c67cd95d380edd4dd0a4d736d5b5756b243ea3665beabde89b945746e368','KALPANA  P','07kalpanap@gmail.com','student','student','student','2005-08-14','2026-08-12',1,1,1,'2025-08-12 16:22:20.048256',2022,2026,0);
INSERT INTO "users" VALUES(56,'22CS058','kamalnathg1@gmail.com','pbkdf2:sha256:600000$FlTXm0NusRWWd5ka$b6821c339c075abcdba1a6e3e825d2ae3b9eb26bf1920e04e070cee41af1e599','KAMALNATH G','kamalnathg1@gmail.com','student','student','student','2004-06-14','2026-08-12',1,1,1,'2025-08-12 16:22:20.316637',2022,2026,0);
INSERT INTO "users" VALUES(57,'22CS059','kaneeshickraaj@gmail.com','pbkdf2:sha256:600000$M7jmjtI5K5kCbTQ8$444b6d61498a1bbe479f9154dacdf5e15f03b1211f52e798b7839b477e95705c','KANEESHICKRAAJ M','kaneeshickraaj@gmail.com','student','student','student','2005-05-02','2026-08-12',1,1,1,'2025-08-12 16:22:20.571181',2022,2026,0);
INSERT INTO "users" VALUES(58,'22CS060','rameshkarthick2381@gmail.com','pbkdf2:sha256:600000$m5tXm9L3plK5G4BM$f761b9e65e934fba408316ae2e4ae86a81d68602854e7549acb96c37f5d67ff7','KARTHICK SELVAN R','rameshkarthick2381@gmail.com','student','student','student','2004-12-23','2026-08-12',1,1,1,'2025-08-12 16:22:20.841846',2022,2026,0);
INSERT INTO "users" VALUES(59,'22CS061','kavinkumarss2005@gmail.com','pbkdf2:sha256:600000$BU3UdE9oUvMVy7DQ$e6f8e92610247443da06a8d89de7723a1f9050a192403138cea927a08871dd93','KAVINKUMAR S','kavinkumarss2005@gmail.com','student','student','student','2005-09-02','2026-08-12',1,1,1,'2025-08-12 16:22:21.153915',2022,2026,0);
INSERT INTO "users" VALUES(60,'22CS062','ppkavinprasanna@gmail.com','pbkdf2:sha256:600000$Ah3mLuRqc1BEa6vh$472fc3dad5db779a146b58708f31363548789ce045161604abb0d2a4a8f9a3a6','KAVINPRASANNA  P','ppkavinprasanna@gmail.com','student','student','student','2005-04-04','2026-08-12',1,1,1,'2025-08-12 16:22:21.464412',2022,2026,0);
INSERT INTO "users" VALUES(61,'22CS187','farhandipu1506@gmail.com','pbkdf2:sha256:600000$5FbdUvgjAQWjmwYX$62953049369101e3de67466318618b5bfe35b72ab7c160a7c824eff6ecc6db29','FARHAN KOBIR DIPU B M','farhandipu1506@gmail.com','student','student','student','2002-10-20','2026-08-12',1,1,1,'2025-08-12 16:22:21.718167',2022,2026,0);
INSERT INTO "users" VALUES(62,'23LCS187','akilarsha28@gmail.com','pbkdf2:sha256:600000$fNlxK6kKwIVp6sJY$41b2d6ca90d2a6e94fccb81866f3b77e3b0dca8eb45604cd22e946bd9f37838e','AKILARASAN R','akilarsha28@gmail.com','student','student','student','2003-08-07','2026-08-12',1,1,1,'2025-08-12 16:22:22.004466',2022,2026,0);
INSERT INTO "users" VALUES(63,'23LCS189','balaji7711s@gmail.com','pbkdf2:sha256:600000$ySKxJzx3XBLI4nNu$804e829e6a61d54be7322a831d056f463c1ff4b1d8785daa6d3a5261908bc020','BALAJI  S','balaji7711s@gmail.com','student','student','student','2002-09-06','2026-08-12',1,1,1,'2025-08-12 16:22:22.289702',2022,2026,0);
INSERT INTO "users" VALUES(64,'23LCS191','jawahargiri1106@gmail.com','pbkdf2:sha256:600000$76gKCl5odW4EvXeO$b625807896fec5b9aaa64fed5123596691b534299756112e353dee4db06b8cc9','JAWAHAR S','jawahargiri1106@gmail.com','student','student','student','2003-10-31','2026-08-12',1,1,1,'2025-08-12 16:22:22.624527',2022,2026,0);
INSERT INTO "users" VALUES(65,'23LCS205','dharanibalraj34@gmail.com','pbkdf2:sha256:600000$DEtXZLPz9Ku8NxMA$c252a2121796217848f6071f7e32960e805073a5ad60ca24fc4ba7f33787fc5a','DHARANI BALRAJ','dharanibalraj34@gmail.com','student','student','student','2003-10-26','2026-08-12',1,1,1,'2025-08-12 16:22:22.960100',2022,2026,0);
INSERT INTO "users" VALUES(66,'22CS063','keerthanajothi943@gmail.com','pbkdf2:sha256:600000$XHPUZwf8ZTPyLZii$f7010b226bef68beff479e744525ac3418d472b1a05bf4fa61a59aed99cde1cc','KEERTHANA S','keerthanajothi943@gmail.com','student','student','student','2005-05-02','2026-08-12',1,1,1,'2025-08-12 16:22:23.306990',2022,2026,0);
INSERT INTO "users" VALUES(67,'22CS064','Khushisinghkhushi24@gmail.com','pbkdf2:sha256:600000$ZkzeTfddNaoppnih$6d77e523e173fd09ef05ebee6f25da3095f0ddbb792999781ac898f085e6a6a6','KHUSHI SINGH','Khushisinghkhushi24@gmail.com','student','student','student','2005-01-24','2026-08-12',1,1,1,'2025-08-12 16:22:23.645409',2022,2026,0);
INSERT INTO "users" VALUES(68,'22CS065','Kirubanithi637@gmail.com','pbkdf2:sha256:600000$DVAP00EuvdJxNW9B$ed9e513313692abe055e78d65317d4303f8638379deb7e26628386c5b01ab828','KIRUBANITHI V','Kirubanithi637@gmail.com','student','student','student','2005-04-13','2026-08-12',1,1,1,'2025-08-12 16:22:23.946486',2022,2026,0);
INSERT INTO "users" VALUES(69,'22CS066','kousikraj2005@gmail.com','pbkdf2:sha256:600000$JtkcA2S1IvZnba2j$c2e718a4d3b2fd513fa18edad70aef366749964a27dc02f2e2fa4455fa08c462','KOUSIKRAJ R T','kousikraj2005@gmail.com','student','student','student','2005-05-14','2026-08-12',1,1,1,'2025-08-12 16:22:24.240451',2022,2026,0);
INSERT INTO "users" VALUES(70,'22CS068','krishnandp2005@gmail.com','pbkdf2:sha256:600000$Gh7SfY3sYeYgZ8F8$b62288c95b7e67eac61917a50df09d5de1389420387926fac4baee7872999eff','KRISHNAN P','krishnandp2005@gmail.com','student','student','student','2005-05-01','2026-08-12',1,1,1,'2025-08-12 16:22:24.531239',2022,2026,0);
INSERT INTO "users" VALUES(71,'22CS069','lakshlakshan82@gmail.com','pbkdf2:sha256:600000$Q9kUqoxsdXe0lbpa$a695a9aca91ffac793a0949e5b897d243e8382d4161263a72efe9b9ed9260b15','LAKSHAN.G','lakshlakshan82@gmail.com','student','student','student','2005-12-06','2026-08-12',1,1,1,'2025-08-12 16:22:24.784698',2022,2026,0);
INSERT INTO "users" VALUES(72,'22CS070','lakshmarathan@gmail.com','pbkdf2:sha256:600000$6s4pvYKWI7nQalX3$9ddc3aa2a843ced3790fc823eb62b91d25952605282fc129dade3886d21778a6','LAKSHMARATHAN.E','lakshmarathan@gmail.com','student','student','student','2003-11-22','2026-08-12',1,1,1,'2025-08-12 16:22:25.070768',2022,2026,0);
INSERT INTO "users" VALUES(73,'22CS071','lakshmidharan2907@gmail.com','pbkdf2:sha256:600000$T4VwEWf2vgyZFm51$cb1b1ecd2b2a4474d6b30700e22496951f1bacc8a768e548aeb4c0841fcaeb5e','LAKSHMIDHARAN.M','lakshmidharan2907@gmail.com','student','student','student','2005-07-29','2026-08-12',1,1,1,'2025-08-12 16:22:25.357883',2022,2026,0);
INSERT INTO "users" VALUES(74,'22CS072','lokeshking769@gmail.com','pbkdf2:sha256:600000$ukfZ6g3XFFXWxABo$712f84b1b72cbfd31ecd4a097586e9abb39133e2caa7c27eb399fe4988a46b99','LOKESH.M','lokeshking769@gmail.com','student','student','student','2004-08-17','2026-08-12',1,1,1,'2025-08-12 16:22:25.641731',2022,2026,0);
INSERT INTO "users" VALUES(75,'22CS073','lokeshwaran2060@gmail.com','pbkdf2:sha256:600000$djJRsd1LOIiRgZlH$65c7191502cbb8e7cd5b961c2cb20f3be1e37d1318b78a80e8e0089ee7f8f730','LOKESHWARAN T','lokeshwaran2060@gmail.com','student','student','student','2005-02-14','2026-08-12',1,1,1,'2025-08-12 16:22:25.925771',2022,2026,0);
INSERT INTO "users" VALUES(76,'22CS074','sureshmathan189@gmail.com','pbkdf2:sha256:600000$YnPzAfyTuDq7BOKS$4b2ad89e02dc3532081fc80207f17d3678690682755302147db4fad6f4325708','MADHAN. S','sureshmathan189@gmail.com','student','student','student','2005-05-16','2026-08-12',1,1,1,'2025-08-12 16:22:26.228906',2022,2026,0);
INSERT INTO "users" VALUES(77,'22CS075','madhuragul7010@gmail.com','pbkdf2:sha256:600000$qsCBbgIXrlpO6PyL$ca7e591794965728bc245b0cd065234edfa0f7050a19725141480c96d1b3b742','MADHU.M','madhuragul7010@gmail.com','student','student','student','2005-07-08','2026-08-12',1,1,1,'2025-08-12 16:22:26.577966',2022,2026,0);
INSERT INTO "users" VALUES(78,'22CS076','mahathaiyal2022@gmail.com','pbkdf2:sha256:600000$FLJYBlyV9wHfF2DB$4836726ba1d0cb059e57f305ba4c98b9fe7e35ef48693fad04bc65c4a5f14e8a','MAHALAKSHMI.P','mahathaiyal2022@gmail.com','student','student','student','2002-04-24','2026-08-12',1,1,1,'2025-08-12 16:22:26.864046',2022,2026,0);
INSERT INTO "users" VALUES(79,'22CS077','kam54176@gmail.com','pbkdf2:sha256:600000$8Ma8vcmUI2uj24Qs$e4fff5ebfc0e5503b67739afb7fc232ee0ea4e3df4e2927a671e6208a3ea462e','MALAR K.A','kam54176@gmail.com','student','student','student','2005-03-23','2026-08-12',1,1,1,'2025-08-12 16:22:27.152234',2022,2026,0);
INSERT INTO "users" VALUES(80,'22CS078','malarvananmariyappan@gmail.com','pbkdf2:sha256:600000$txJe1B7ejHjD7Y0q$12e37a8430859c1189c6423bf70bb158b988833a0e3617056755f460dc1b077d','MALARVANAN M','malarvananmariyappan@gmail.com','student','student','student','2004-10-31','2026-08-12',1,1,1,'2025-08-12 16:22:27.438861',2022,2026,0);
INSERT INTO "users" VALUES(81,'22CS079','manikandanraja438@gmail.com','pbkdf2:sha256:600000$P4tE6L26HHEW4S2w$2bed5f022a5f00d58881b4d27f7d44be2a2b381fbd08ade2c06527ab8a13ff6c','MANIKANDAN R','manikandanraja438@gmail.com','student','student','student','2005-03-01','2026-08-12',1,1,1,'2025-08-12 16:22:27.726265',2022,2026,0);
INSERT INTO "users" VALUES(82,'22CS080','manivtr1510@gmail.com','pbkdf2:sha256:600000$RQPNm6mpvqXJE9Vj$5f2708ceb73903e4ee3869de315f9d26cf4cd82700c424fab8906428c32ec7c8','MANIKANDAN.S','manivtr1510@gmail.com','student','student','student','2004-10-15','2026-08-12',1,1,1,'2025-08-12 16:22:28.024515',2022,2026,0);
INSERT INTO "users" VALUES(83,'22CS081','manishkumaryadav8789651809@gmail.com','pbkdf2:sha256:600000$cERmZBzALQWDOrt0$6bea7c98a130ff8c04ea3018e3cf9aaa44dc2400a72d23ce33ca9e5236a85528','MANISH KUMAR YADAV','manishkumaryadav8789651809@gmail.com','student','student','student','2003-01-01','2026-08-12',1,1,1,'2025-08-12 16:22:28.310357',2022,2026,0);
INSERT INTO "users" VALUES(84,'22CS082','manjukumaran434@gmail.com','pbkdf2:sha256:600000$SJYqPcPCMmc4OZQo$c208072ed8867d5f4e2b3bcc9acaae357387c4491681102d3df34ad8aaa95172','MANJUKUMARAN  C','manjukumaran434@gmail.com','student','student','student','2005-01-27','2026-08-12',1,1,1,'2025-08-12 16:22:28.612558',2022,2026,0);
INSERT INTO "users" VALUES(85,'22CS083','manosanjaymano@gmail.com','pbkdf2:sha256:600000$7gX7SGHqe64rWOih$a060070044bd40890a842794820d1d5fc6c678c525b933b3496142e5ad8c61a1','MANO  C','manosanjaymano@gmail.com','student','student','student','2005-05-18','2026-08-12',1,1,1,'2025-08-12 16:22:28.882303',2022,2026,0);
INSERT INTO "users" VALUES(86,'22CS084','mano143ilun@gmail.com','pbkdf2:sha256:600000$95tFrvKEEWhpz7VX$c8a4e041ea11eecb1c1ae151132815f60bfbc2a62d11f56e1e7d13c48c7571b4','MANOJKUMAR G','mano143ilun@gmail.com','student','student','student','2004-02-04','2026-08-12',1,1,1,'2025-08-12 16:22:29.167919',2022,2026,1);
INSERT INTO "users" VALUES(87,'22CS085','manosrikanthrs2004@gmail.com','pbkdf2:sha256:600000$4vRLdU1yKsc5cwd0$5702fa58261f024f24e7a42cc62687b1c8532e753031fd47900d28f618376f24','MANOSRIKANTH R S','manosrikanthrs2004@gmail.com','student','student','student','2004-09-13','2026-08-12',1,1,1,'2025-08-12 16:22:29.471444',2022,2026,0);
INSERT INTO "users" VALUES(88,'22CS087','mdirshad735227@gmail.com','pbkdf2:sha256:600000$kLirwpoSIiB0zT1C$28d2d846fac8461a03569345a63d7f80ce6f5d350f6ec45ee20f3c2a7a13c248','MD. IRSHAD','mdirshad735227@gmail.com','student','student','student','2003-11-07','2026-08-12',1,1,1,'2025-08-12 16:22:29.740861',2022,2026,0);
INSERT INTO "users" VALUES(89,'22CS088','mraja9105@gmail.com','pbkdf2:sha256:600000$JEytvCajDRmIEEku$35db9dcb1a02bf10ee52f66f60c4088e021590f9a4a251acc4403c19e6d3044e','MD RAJA','mraja9105@gmail.com','student','student','student','2002-01-01','2026-08-12',1,1,1,'2025-08-12 16:22:30.042692',2022,2026,0);
INSERT INTO "users" VALUES(90,'22CS089','mdsafdaransarim@gmail.com','pbkdf2:sha256:600000$If9qujWQlfjxja4M$25ff1f13500e0689b1c445027b67d2500a025000aab378d32360bba3763a0708','MD SAFDAR ANSARI','mdsafdaransarim@gmail.com','student','student','student','2003-02-14','2026-08-12',1,1,1,'2025-08-12 16:22:30.343179',2022,2026,0);
INSERT INTO "users" VALUES(91,'22CS090','mithradevikathirvel2005@gmail.com','pbkdf2:sha256:600000$ODhAM0BQS7pMf1X7$70f72e0c1da504a302b5f5b6a0d7f5627831b691e14c1cfd126b0bfc0483120f','MITHRADEVI.K','mithradevikathirvel2005@gmail.com','student','student','student','2005-03-13','2026-08-12',1,1,1,'2025-08-12 16:22:30.608427',2022,2026,0);
INSERT INTO "users" VALUES(92,'22CS091','getniyashere@gmail.com','pbkdf2:sha256:600000$aw4dQf6gPXl0nij3$7211b8aa4bd903a958d1f37d7ea59d81cb990d6e8d2cf38c209a088a6600c1f4','MOHAMMED NIYAS T','getniyashere@gmail.com','student','student','student','2002-12-18','2026-08-12',1,1,1,'2025-08-12 16:22:30.911920',2022,2026,0);
INSERT INTO "users" VALUES(93,'22CS092','shibilcs0@gmail.com','pbkdf2:sha256:600000$rdPdDxdAoxbAyEKZ$99eb94e8c67147e706b4afaa65b1c1e880f6035158df51cb2bebb3127f9995e3','MOHAMMED SHIBIL  A C','shibilcs0@gmail.com','student','student','student','2003-10-23','2026-08-12',1,1,1,'2025-08-12 16:22:31.172957',2022,2026,0);
INSERT INTO "users" VALUES(94,'22CS093','jomohan999@gmail.com','pbkdf2:sha256:600000$Sm7WR6eSdS57vCWE$7be7bcfb25ef1fcf9808f7fcb315747e89bd4267c7d2d62a573f29f0945a8d68','MOHAN RAJ K','jomohan999@gmail.com','student','student','student','2005-04-20','2026-08-12',1,1,1,'2025-08-12 16:22:31.458658',2022,2026,0);
INSERT INTO "users" VALUES(95,'22CS095','mohitmishrarxl@gmail.com','pbkdf2:sha256:600000$MvsoVBHwYYX05h1o$3b77d3c0d538e4eeb2bcbd5116ef87d123dfcfa2c3b6a26ab47ad990037bc7ff','MOHIT MISHRA','mohitmishrarxl@gmail.com','student','student','student','2003-08-19','2026-08-12',1,1,1,'2025-08-12 16:22:31.729036',2022,2026,0);
INSERT INTO "users" VALUES(96,'22CS096','Mjjinu321@gmail.com','pbkdf2:sha256:600000$IguEqIaO4DsQqXKM$73bfc03d419bbd0085dd46f256b40c0c809c91335f776b06a5cebcabd70dd7f3','MUHAMMED JISHAD C P','Mjjinu321@gmail.com','student','student','student','2002-09-18','2026-08-12',1,1,1,'2025-08-12 16:22:32.033357',2022,2026,0);
INSERT INTO "users" VALUES(97,'22CS097','roshanabdu788@gmail.com','pbkdf2:sha256:600000$OZQEbIGdfPT7WwXH$cf9d0913f60f4b84353d2a4b4fdd14587e36f006f0b40fc363e354e351e8ac77','MUHAMMED ROSHAN K P','roshanabdu788@gmail.com','student','student','student','2003-10-18','2026-08-12',1,1,1,'2025-08-12 16:22:32.317478',2022,2026,0);
INSERT INTO "users" VALUES(98,'22CS098','muralibalu2005@gmail.com','pbkdf2:sha256:600000$WkFAq5TMIlfCR0ca$de2ac89674d53e5a80f3b0fae96f42fd07aa7c50d30327fb6f61a36b58275a91','MURALITHARAN P','muralibalu2005@gmail.com','student','student','student','2005-04-30','2026-08-12',1,1,1,'2025-08-12 16:22:32.602986',2022,2026,0);
INSERT INTO "users" VALUES(99,'22CS099','muthulakshmikannan6122004@gmail.com','pbkdf2:sha256:600000$CoMQldHQEI5nDrJy$67b4794cd6c28205373185dbf5cc6f8c569dee193994912e0c2e615bfe6f80ae','MUTHULAKSHMI K','muthulakshmikannan6122004@gmail.com','student','student','student','2004-06-12','2026-08-12',1,1,1,'2025-08-12 16:22:32.888142',2022,2026,0);
INSERT INTO "users" VALUES(100,'22CS100','tamilsundhar49@gmail.com','pbkdf2:sha256:600000$9SF3JfneTB5CGwD9$751e63e437b72fe6f7bc701bf1c70a6ca7ed4d614304afff8594cbbf6f728bee','NALANTAMIL S','tamilsundhar49@gmail.com','student','student','student','2005-01-31','2026-08-12',1,1,1,'2025-08-12 16:22:33.175101',2022,2026,0);
INSERT INTO "users" VALUES(101,'22CS101','gv.navaneeth333@gmail.com','pbkdf2:sha256:600000$ZIwv1ZGEeUeEby5f$49197a6a4854a9f08d33fbd7bdbd09adc51352cd001713337cde58e4d26dbe12','NAVANEETH G V','gv.navaneeth333@gmail.com','student','student','student','2005-03-30','2026-08-12',1,1,1,'2025-08-12 16:22:33.475602',2022,2026,0);
INSERT INTO "users" VALUES(102,'22CS102','navaneethan007dk@gmail.com','pbkdf2:sha256:600000$xfLgIB3MvvUFOoZH$85528630d2ebad41c9cdd75a330095816b9a2d800a52fabfe5211b90aab80974','NAVANEETHA KRISHNAN R','navaneethan007dk@gmail.com','student','student','student','2005-06-20','2026-08-12',1,1,1,'2025-08-12 16:22:33.777552',2022,2026,0);
INSERT INTO "users" VALUES(103,'22CS103','n384487@gmail.com','pbkdf2:sha256:600000$Q6SJgW7er8UN0PPZ$31abad1face582a45dbc42ef04df9df424e9e7fd07214cafdfd48ca57a505efe','NAVEEN RAJ R','n384487@gmail.com','student','student','student','2005-09-09','2026-08-12',1,1,1,'2025-08-12 16:22:34.095262',2022,2026,0);
INSERT INTO "users" VALUES(104,'22CS104','nehanth20042828@gmail.com','pbkdf2:sha256:600000$8XYVR2LVPkKgt126$9acc33caad328ba0c84e79753424dc7b5901bd0b50f1ef77b5f7ff680524916d','NEHANTH C','nehanth20042828@gmail.com','student','student','student','2004-02-10','2026-08-12',1,1,1,'2025-08-12 16:22:34.379892',2022,2026,0);
INSERT INTO "users" VALUES(105,'22CS105','nevinshoby.xib@gmail.com','pbkdf2:sha256:600000$bYSGqoOXCX5tb1Np$160b23b579f5690302957551573a9c2a63a856c38c92960b9a5b1d664b04b918','NEVIN SHOBY','nevinshoby.xib@gmail.com','student','student','student','2004-04-26','2026-08-12',1,1,1,'2025-08-12 16:22:34.681168',2022,2026,0);
INSERT INTO "users" VALUES(106,'22CS106','nithibvned@gmail.com','pbkdf2:sha256:600000$oFUYPHQ7HntsGRfE$6f621dcb8ec7902d4bde9cc02170c43d2f1a88a3ca12919d4e6384109c3ff2ee','NITHI SRII  P K','nithibvned@gmail.com','student','student','student','2005-05-23','2026-08-12',1,1,1,'2025-08-12 16:22:34.974649',2022,2026,0);
INSERT INTO "users" VALUES(107,'22CS107','rajkavi1188@gmail.com','pbkdf2:sha256:600000$xNdxUZ7TWqtIC60n$5883802cf561726d3dce1991b5db8d172730cdafaa5463aa4535d1ad6e2eaef2','NITHYASHRI M','rajkavi1188@gmail.com','student','student','student','2005-05-23','2026-08-12',1,1,1,'2025-08-12 16:22:35.259717',2022,2026,0);
INSERT INTO "users" VALUES(108,'22CS108','nitishscientist99@gmail.com','pbkdf2:sha256:600000$IOtrYDoPOatXMcmZ$c4fbdf6b58513bb01a12abc8cbe82f79a9f345f2960189ba7351864fe296a12b','NITISH KUMAR','nitishscientist99@gmail.com','student','student','student','2004-12-04','2026-08-12',1,1,1,'2025-08-12 16:22:35.556330',2022,2026,0);
INSERT INTO "users" VALUES(109,'22CS110','pandikannan.u2005@gmail.com','pbkdf2:sha256:600000$mANTbDpTLm0t3NvK$3657781a8119e63cf6f6d46df35e329de93c812b0ded972d16ec2b62d3c32f7a','PANDIKANNAN U','pandikannan.u2005@gmail.com','student','student','student','2005-02-26','2026-08-12',1,1,1,'2025-08-12 16:22:35.842546',2022,2026,0);
INSERT INTO "users" VALUES(110,'22CS111','poovarasankumarmalar@gmail.com','pbkdf2:sha256:600000$DdDnxFruh3AXoxgr$f4880a9d910ccb652a3910a46dda8fd5ca24c5340fc3f27e08c21b06149fa414','POOVARASAN K','poovarasankumarmalar@gmail.com','student','student','student','2003-10-03','2026-08-12',1,1,1,'2025-08-12 16:22:36.128194',2022,2026,0);
INSERT INTO "users" VALUES(111,'22CS112','Pradeeptamilan4@gmail.com','pbkdf2:sha256:600000$NP3rVuT0GEFX8xT7$84a9fdb4494d3e8179e97c431e0616299cc0006fe52c3767ba7aa40e122ed4cd','PRADEEP B','Pradeeptamilan4@gmail.com','student','student','student','2004-12-12','2026-08-12',1,1,1,'2025-08-12 16:22:36.430732',2022,2026,0);
INSERT INTO "users" VALUES(112,'22CS113','prasanna23122004@gmail.com','pbkdf2:sha256:600000$xtQJCte9l4RBb4hJ$edaee442e3b036bd0a099cf47c0dd17d9e0209de3bc5d3d522974fe1758fa0e9','PRASANNA  C','prasanna23122004@gmail.com','student','student','student','2004-12-23','2026-08-12',1,1,1,'2025-08-12 16:22:36.721480',2022,2026,0);
INSERT INTO "users" VALUES(113,'22CS114','prasanthr26505@gmail.com','pbkdf2:sha256:600000$jC64Fn69CZlX725g$4f4e203cf6ca15b621ae97e155f8fce477a34e7944bca5754e7a464e8f2ac804','PRASANTH.R','prasanthr26505@gmail.com','student','student','student','2005-05-26','2026-08-12',1,1,1,'2025-08-12 16:22:36.970259',2022,2026,0);
INSERT INTO "users" VALUES(114,'22CS115','praveen4412117@gmail.com','pbkdf2:sha256:600000$2i5ZvHal6y7QxKUz$23f392aefdb9a25f53bb63daf0712dd5a41cc6ff2941d755868be7c00e042f33','PRAVEEN K','praveen4412117@gmail.com','student','student','student','2005-04-27','2026-08-12',1,1,1,'2025-08-12 16:22:37.279825',2022,2026,0);
INSERT INTO "users" VALUES(115,'22CS116','praveenathangaraj22@gmail.com','pbkdf2:sha256:600000$oFQpCqhDanQ6PejX$17655f7e9d3e2d5c502cf6ce1044c9fd66e1b354cfd944ea2ad5fcc8ada282ef','PRAVEENA T','praveenathangaraj22@gmail.com','student','student','student','2004-12-13','2026-08-12',1,1,1,'2025-08-12 16:22:37.606637',2022,2026,0);
INSERT INTO "users" VALUES(116,'22CS117','premalathasubramani2004@gmail.com','pbkdf2:sha256:600000$RZU2QgrkJ8ayn0yh$df67d8501c723f2be4467283323800781ce026e5833c74453d0470540a9585b9','PREMALATHA.S','premalathasubramani2004@gmail.com','student','student','student','2004-08-19','2026-08-12',1,1,1,'2025-08-12 16:22:37.877396',2022,2026,0);
INSERT INTO "users" VALUES(117,'22CS118','padmanabanpriya09@gmail.com','pbkdf2:sha256:600000$EDzdAdhbSBTJu3rd$c73de6cd820e1e9f8084b4185e6876e352aa785d2d4bde537b3667ee4f12445c','PRIYANKA P','padmanabanpriya09@gmail.com','student','student','student','2005-06-02','2026-08-12',1,1,1,'2025-08-12 16:22:38.178966',2022,2026,0);
INSERT INTO "users" VALUES(118,'22CS119','johnpugazh1808@gmail.com','pbkdf2:sha256:600000$VMBJHjm9CdiybpYn$6e1eeaadf32b5c1f31c5c853ee4d9df4c53b048dd7ea858ed74c81ee106a95e3','PUGAZHARASAN G','johnpugazh1808@gmail.com','student','student','student','2005-07-20','2026-08-12',1,1,1,'2025-08-12 16:22:38.433332',2022,2026,0);
INSERT INTO "users" VALUES(119,'22CS120','ragavan212005@gmail.com','pbkdf2:sha256:600000$xH3WhOtT78GsZmAG$b223d75a3bf11c6151063454d9e51677dd07e0c1eadb29f137dcf27ae3d6d7a0','RAGAVAN S','ragavan212005@gmail.com','student','student','student','2005-04-21','2026-08-12',1,1,1,'2025-08-12 16:22:38.713582',2022,2026,0);
INSERT INTO "users" VALUES(120,'22CS121','jaishwalragini@gmail.com','pbkdf2:sha256:600000$0aDDqIcaFEwjLbi3$1a539c270f65af97c26b0c2d4d29582fbee6735ba42763d857168e9758aa2af1','RAGINI JAISWAL','jaishwalragini@gmail.com','student','student','student','2006-05-02','2026-08-12',1,1,1,'2025-08-12 16:22:39.035018',2022,2026,0);
INSERT INTO "users" VALUES(121,'22CS122','raguraguff47@gamil.com','pbkdf2:sha256:600000$aTajCLY6CfRICC67$68dd091125aa1cde47d41d8b09c05d554083ccb8ed313659fd5c20e47e103794','RAGUNATH K C','raguraguff47@gamil.com','student','student','student','2004-12-08','2026-08-12',1,1,1,'2025-08-12 16:22:39.320574',2022,2026,0);
INSERT INTO "users" VALUES(122,'22CS188','mabasithpullambalavan@gmail.com','pbkdf2:sha256:600000$mRHgwUEwYT8zYFwd$d399b1d0d8c1c572b2539b39e25a21429780c46a48418274850c5e16f1468e9d','MOHAMMED ABDUL BASITH P','mabasithpullambalavan@gmail.com','student','student','student','2003-12-19','2026-08-12',1,1,1,'2025-08-12 16:22:39.593661',2022,2026,0);
INSERT INTO "users" VALUES(123,'22CS189','cpushpa019@gmail.com','pbkdf2:sha256:600000$BVjf7htBIx05a0p4$c9f71a52c6a7413994f2939ccfe46f5ac0c105627f0d056e21bc913729b51c20','PUSHPA CHAUHAN','cpushpa019@gmail.com','student','student','student','2004-07-18','2026-08-12',1,1,1,'2025-08-12 16:22:39.892932',2022,2026,0);
INSERT INTO "users" VALUES(124,'23LCS192','sakthikalai666@gmail.com','pbkdf2:sha256:600000$0H4jFaqiIfRNNWUn$274a95979ecef9a5cab1d14f3a244f004c2f19efd35d7fcd572afbb586cfce7f','KALAIARASAN S','sakthikalai666@gmail.com','student','student','student','1999-12-13','2026-08-12',1,1,1,'2025-08-12 16:22:40.162577',2022,2026,0);
INSERT INTO "users" VALUES(125,'23LCS193','kumaranudayasankar08@gmail.com','pbkdf2:sha256:600000$MiOJNkypyXHZdsrx$ae50c42dc7cbcc6f26dbc547d433aaa1b4c3d85d43738e079c8c5d5583541784','KUMARAN U','kumaranudayasankar08@gmail.com','student','student','student','2005-08-06','2026-08-12',1,1,1,'2025-08-12 16:22:40.458385',2022,2026,0);
INSERT INTO "users" VALUES(126,'23LCS194','mithunbalas207@gmail.com','pbkdf2:sha256:600000$S2YcwkKtCQCI1Ud5$4b7d112c74ef7bc6d7a91671f5823d1ac25c1d02bda930759388c9e44c6b12d2','MITHUNKUMAR','mithunbalas207@gmail.com','student','student','student','2004-07-20','2026-08-12',1,1,1,'2025-08-12 16:22:40.751964',2022,2026,0);
INSERT INTO "users" VALUES(127,'23LCS195','afreed2526@gmail.com','pbkdf2:sha256:600000$bs20cyMOASqimBWA$6646134f469b03c5a1a1adae784d1ec68910849d3cb1ae2eb01bcbc7d3ed6aa5','MOHAMMED AFREED A','afreed2526@gmail.com','student','student','student','2001-01-25','2026-08-12',1,1,1,'2025-08-12 16:22:41.019814',2022,2026,0);
INSERT INTO "users" VALUES(128,'23LCS196','chrisharun001@gmail.com','pbkdf2:sha256:600000$EeAtPFvWUguE7xN7$908d77c81a0c09e4911dd88b8c7930fc0789c7a7faf7179842f2184bf03c97f1','MOHANA PRASAD S','chrisharun001@gmail.com','student','student','student','2000-06-07','2026-08-12',1,1,1,'2025-08-12 16:22:41.289670',2022,2026,0);
INSERT INTO "users" VALUES(129,'23LCS197','rajkumarhardik033@gmail.com','pbkdf2:sha256:600000$jwLKsgKysCKwmwoj$9a63911d5b05a3444f7880838fc3e4874046246c804841c51d57484f141b064f','RAJKUMAR A','rajkumarhardik033@gmail.com','student','student','student','2004-12-31','2026-08-12',1,1,1,'2025-08-12 16:22:41.564873',2022,2026,0);
INSERT INTO "users" VALUES(130,'22CS124','rajendrakumarram638@gmail.com','pbkdf2:sha256:600000$jcV5pIza2psem5rx$6055ec5342bf5a83c7bc11b8b6b3b476aa2fbae4ac95036af14ca7d8e9585976','RAJENDRA KUMAR RAM','rajendrakumarram638@gmail.com','student','student','student','2004-08-17','2026-08-12',1,1,1,'2025-08-12 16:22:41.894374',2022,2026,0);
INSERT INTO "users" VALUES(131,'22CS125','saravananrajeshdragorider@gmail.com','pbkdf2:sha256:600000$OahRJmfJiOzYs20m$73ed0e3500dfdb4e3f24e73c68e07cb8d26f0a0c7b0f62eabe64dc0101fd44ca','RAJESH S','saravananrajeshdragorider@gmail.com','student','student','student','2004-03-20','2026-08-12',1,1,1,'2025-08-12 16:22:42.208526',2022,2026,0);
INSERT INTO "users" VALUES(132,'22CS127','kumarramnishani123@gmail.com','pbkdf2:sha256:600000$n3824CrL3hmesPwW$b6cc424a5169f081149b8887a35eb8eb492f80d817406a3d4ff61f2991c516a6','RAMNISHANI KUMAR','kumarramnishani123@gmail.com','student','student','student','2003-01-20','2026-08-12',1,1,1,'2025-08-12 16:22:42.526511',2022,2026,0);
INSERT INTO "users" VALUES(133,'22CS128','renoyjacob954433@gmail. Com','pbkdf2:sha256:600000$ILi8DpBGLKtBP0Hs$dfe0ef5e91b9beab734559f1a5ba5387cbbe05198aea5fcca012e0f5ed6c964c','RENOY JACOB','renoyjacob954433@gmail. Com','student','student','student','2004-01-18','2026-08-12',1,1,1,'2025-08-12 16:22:42.842573',2022,2026,0);
INSERT INTO "users" VALUES(134,'22CS129','rithikaanbu0402@gmail.com','pbkdf2:sha256:600000$fPrdoMTQsmjXYy4u$fd6c40ef5f389555cc8b52930dbc805deb9503cd404cfa0425d26458f445e1ea','RITHIKA A','rithikaanbu0402@gmail.com','student','student','student','2005-04-01','2026-08-12',1,1,1,'2025-08-12 16:22:43.218075',2022,2026,0);
INSERT INTO "users" VALUES(135,'22CS130','rubanagaraj2005@gmail.com','pbkdf2:sha256:600000$mzCkMieFa8AvB2oH$f49ee2aa104ce6022af1ba49d9dccb3ec457a4c653470a14bd1b3f17b56684f5','RUBA. N','rubanagaraj2005@gmail.com','student','student','student','2005-02-01','2026-08-12',1,1,1,'2025-08-12 16:22:43.510025',2022,2026,0);
INSERT INTO "users" VALUES(136,'22CS131','ruhisabhia@gmail.com','pbkdf2:sha256:600000$zhbB0ZWPI3XErTNF$727ff5580fb8ba4045bcba26a71d62e4222d446aaff5e8223bbb38e77b116b57','RUHI SABHIA A','ruhisabhia@gmail.com','student','student','student','2005-03-17','2026-08-12',1,1,1,'2025-08-12 16:22:43.796774',2022,2026,0);
INSERT INTO "users" VALUES(137,'22CS132','sabarishanmugam357@gmail.com','pbkdf2:sha256:600000$xJJOoeWIRQCBa2Vv$cc365e7d3fe657c1e485dcdf491c197d351b8beb989a5e334290478e3d0ae1a9','SABAREESWARAN S','sabarishanmugam357@gmail.com','student','student','student','2005-01-27','2026-08-12',1,1,1,'2025-08-12 16:22:44.066766',2022,2026,0);
INSERT INTO "users" VALUES(138,'22CS133','sakthivel9025193952@gmail.com','pbkdf2:sha256:600000$fwcdjQJ6GXzLjMgV$f2255d64dd6514f77b3367f4847cb52a9be8a39ff98f388a2df310f0f7444199','SAKTHIVEL S','sakthivel9025193952@gmail.com','student','student','student','2005-02-01','2026-08-12',1,1,1,'2025-08-12 16:22:44.325028',2022,2026,0);
INSERT INTO "users" VALUES(139,'22CS134','Salmanulfaris2332@gmail.com','pbkdf2:sha256:600000$YmaB1eJy5lII9WGB$de12d92783480c7902cf61bc47f2e86313a6761457e45a2da1c94b96d80d2ea0','SALMANUL FARIS','Salmanulfaris2332@gmail.com','student','student','student','2003-09-17','2026-08-12',1,1,1,'2025-08-12 16:22:44.639426',2022,2026,0);
INSERT INTO "users" VALUES(140,'22CS135','sameeralam9845@gmail.com','pbkdf2:sha256:600000$K2mfK15Oq96oj8jx$81285bb196cd0e14eaa3b079f2c1272d2c6eb29e3ed4413bcfaf4e077c5184bb','SAMEER ALAM','sameeralam9845@gmail.com','student','student','student','2004-06-24','2026-08-12',1,1,1,'2025-08-12 16:22:44.876051',2022,2026,0);
INSERT INTO "users" VALUES(141,'22CS136','samidurai200321@gmail.com','pbkdf2:sha256:600000$R7aByhhyMtsRmy7k$9a3208791662bd24a6cfcc42233b5797cfc18952c6ccc4b3c9c5c9a08c059b1f','SAMI DURAI V','samidurai200321@gmail.com','student','student','student','2003-06-21','2026-08-12',1,1,1,'2025-08-12 16:22:45.180299',2022,2026,0);
INSERT INTO "users" VALUES(142,'22CS137','sanjaysathiyan2004@gmail.com','pbkdf2:sha256:600000$R0fhAmmXbIh5xTuL$16e37feca163124f19f93ba36fae36e62adcad2c790a866e4affc52f1faa8072','SANJAY S','sanjaysathiyan2004@gmail.com','student','student','student','2004-02-22','2026-08-12',1,1,1,'2025-08-12 16:22:45.436392',2022,2026,0);
INSERT INTO "users" VALUES(143,'22cs138','sanjaysanjay47254@gmail.com','pbkdf2:sha256:600000$gNrwjLpP4gW6IZTI$8e5845e1d5d2e2a81e01697979f1f85ce9f107f5d038279a86e6e9c84f1b98fd','SANJAY T','sanjaysanjay47254@gmail.com','student','student','student','2005-10-01','2026-08-12',1,1,1,'2025-08-12 16:22:45.720638',2022,2026,0);
INSERT INTO "users" VALUES(144,'22CS139','sanjayvediyappan007@gmail.com','pbkdf2:sha256:600000$sZcCzpwBdLOLBTyR$23761bcbad406ec431fce9769cc3f192df765b08abe118a6adc7e787b53e62a9','SANJAY V','sanjayvediyappan007@gmail.com','student','student','student','2005-08-01','2026-08-12',1,1,1,'2025-08-12 16:22:45.974355',2022,2026,0);
INSERT INTO "users" VALUES(145,'22CS141','Santhoshsprsankar@gmail.com','pbkdf2:sha256:600000$0BNUy4K5XN4n8kaa$4bee1eef1ceedc3587484f0f7584cc923deaf4fc9b7b3013b1da7905e5daa419','SANTHOSH S','Santhoshsprsankar@gmail.com','student','student','student','2004-09-26','2026-08-12',1,1,1,'2025-08-12 16:22:46.294377',2022,2026,0);
INSERT INTO "users" VALUES(146,'22CS142','sarath9947048735@gmail.com','pbkdf2:sha256:600000$Mk0xtsKmNzTXpfzX$12dcdbbaa43dbce6e86ce3ee93f02c6bf7da9656ba4991a2a22588339fbbf5b4','SARATH K','sarath9947048735@gmail.com','student','student','student','2003-12-08','2026-08-12',1,1,1,'2025-08-12 16:22:46.608050',2022,2026,0);
INSERT INTO "users" VALUES(147,'22CS143','Sarathysubbu410@gmail.com','pbkdf2:sha256:600000$wn7maVs9fHtUulSb$53745a15b1b4a616e6a5d4b5de232546fefdff8527a6e0f914445096e9818dba','SARATHY S','Sarathysubbu410@gmail.com','student','student','student','2004-07-17','2026-08-12',1,1,1,'2025-08-12 16:22:46.889400',2022,2026,0);
INSERT INTO "users" VALUES(148,'22CS144','saravanansaheen61@gmail.com','pbkdf2:sha256:600000$8G4Vj3DJcx2AmSh6$0fde77ea6073a6fafc1e414dc12910c82dc80f1b3fc6fe8ba3d5857d68c80ff2','SARAVANAN E','saravanansaheen61@gmail.com','student','student','student','2005-06-21','2026-08-12',1,1,1,'2025-08-12 16:22:47.163396',2022,2026,0);
INSERT INTO "users" VALUES(149,'22CS145','Sarukraj2015@gmail.com','pbkdf2:sha256:600000$HS6wPGQDehyry2FA$b043953449434694b23e5a026dcddcc51331bd8e9e16432e5bcbedc3107c23ff','SARUK RAJ.S','Sarukraj2015@gmail.com','student','student','student','2004-12-20','2026-08-12',1,1,1,'2025-08-12 16:22:47.449750',2022,2026,0);
INSERT INTO "users" VALUES(150,'22cs146','sathyendran86@gmail.com','pbkdf2:sha256:600000$XQZvlarAYUg2M9Lr$23b2e384dc38dda4fb40cc022e4152e2e6a4000fc703ce4e31086a2168eb136e','SATHYENDRAN V','sathyendran86@gmail.com','student','student','student','2005-08-07','2026-08-12',1,1,1,'2025-08-12 16:22:47.752833',2022,2026,0);
INSERT INTO "users" VALUES(151,'22CS147','saurav7907225300@gmail.com','pbkdf2:sha256:600000$o1chRAsHGnkEVd7W$c18769e24f2c0d03766064f7bfa198ecb722a9cbe8b4a7f24f3f36c7d285100a','SAURAV K','saurav7907225300@gmail.com','student','student','student','2003-12-08','2026-08-12',1,1,1,'2025-08-12 16:22:48.019561',2022,2026,0);
INSERT INTO "users" VALUES(152,'22CS148','selvakumar4392@gmail.com','pbkdf2:sha256:600000$GXjCd83oPq7A4jCe$b53afe56f82eba6a9bab923c6aaa5aaa6978426cbdeab42c43c0728f0cad5dd9','SELVAKUMAR P','selvakumar4392@gmail.com','student','student','student','2004-12-13','2026-08-12',1,1,1,'2025-08-12 16:22:48.317136',2022,2026,0);
INSERT INTO "users" VALUES(153,'22CS149','shanu123shaheen@gmail.com','pbkdf2:sha256:600000$9NlWmhKoLygShm4O$9fd7dc150775bf40266dfde80ab4f59155e670278724dcb05f39298a1f1fe227','SHAHEEN MUSTHAFA VP','shanu123shaheen@gmail.com','student','student','student','2003-11-20','2026-08-12',1,1,1,'2025-08-12 16:22:48.591805',2022,2026,0);
INSERT INTO "users" VALUES(154,'22cs150','csilambarasan374@gmail.com','pbkdf2:sha256:600000$kBBweEPDbkzK0pQ8$f36e51e25067e4d62ab554592568f92579938b65a1772f542e7b085868bea133','SILAMBARASAN C','csilambarasan374@gmail.com','student','student','student','2005-12-02','2026-08-12',1,1,1,'2025-08-12 16:22:48.877589',2022,2026,0);
INSERT INTO "users" VALUES(155,'22CS151','sivaprakash95259@gmail.com','pbkdf2:sha256:600000$kIf5PXIH3WLG8Qii$7e5cfd5627dc4a9f5bc36cc7ee41128df602ceabfb34357eabfddf781b732b49','SIVAPRAKASH A R','sivaprakash95259@gmail.com','student','student','student','2005-07-21','2026-08-12',1,1,1,'2025-08-12 16:22:49.166579',2022,2026,0);
INSERT INTO "users" VALUES(156,'22CS152','sivamurugan9055@gmail.com','pbkdf2:sha256:600000$tOFWyetLGQ7Ljrge$7e31ce1e06727719ce914ca54f53303f9f20337fe4e36c0fa390689b6a0c81e5','SIVAMURUGAN M','sivamurugan9055@gmail.com','student','student','student','2005-07-24','2026-08-12',1,1,1,'2025-08-12 16:22:49.480753',2022,2026,0);
INSERT INTO "users" VALUES(157,'22CS153','sivanandhamvelmurugan64@gamil.com','pbkdf2:sha256:600000$Lcbu7ixeAto5FLiI$e0afcc593521df714d24f40584c5c4ae6cf0684584019fd4b241dddee320e5be','SIVANANDHAM  V','sivanandhamvelmurugan64@gamil.com','student','student','student','2005-04-13','2026-08-12',1,1,1,'2025-08-12 16:22:49.739181',2022,2026,0);
INSERT INTO "users" VALUES(158,'22CS154','v.sneshvishal@gmail.com','pbkdf2:sha256:600000$GKhjfwoGMtTZ4rLI$75333bd10d6d60080ab23fe2180b6933c93618762f74f567318011183045c5b6','SNESH VISHAL','v.sneshvishal@gmail.com','student','student','student','2004-11-30','2026-08-12',1,1,1,'2025-08-12 16:22:50.052344',2022,2026,0);
INSERT INTO "users" VALUES(159,'22CS155','sriharini1002@gamil.com','pbkdf2:sha256:600000$UC9Xmp2NKuYM2jlS$34d0117a39fd2761029eeb4dfa4d1e6f7924f0d32cf21b59bb84f205dde6b777','SRIHARINI.S','sriharini1002@gamil.com','student','student','student','2005-01-24','2026-08-12',1,1,1,'2025-08-12 16:22:50.324362',2022,2026,0);
INSERT INTO "users" VALUES(160,'22CS156','sritharips266@gmail.com','pbkdf2:sha256:600000$yhOsrVoBG89BQsQQ$7f86031280aab4eb3cfe26644b49bc8f9a4ec55adebe806cba84e415a04884db','SRITHAR.S','sritharips266@gmail.com','student','student','student','2003-10-09','2026-08-12',1,1,1,'2025-08-12 16:22:50.626465',2022,2026,0);
INSERT INTO "users" VALUES(161,'22CS157','subashri1756@gmail.com','pbkdf2:sha256:600000$e2PhZi8s6kqzj0NK$2dc229b034500be8feadee1391b29c3cb44a0252b99932766d17052ce884b2ca','SUBASHRI D','subashri1756@gmail.com','student','student','student','2005-08-24','2026-08-12',1,1,1,'2025-08-12 16:22:50.928833',2022,2026,0);
INSERT INTO "users" VALUES(162,'22CS158','Subadharaneeshs@gmail.com','pbkdf2:sha256:600000$EukK45ofRkWG58ge$8364ff8377e3cbbd87e360a6a38853bc018010c5c5849643075d2d95dab17094','SUBASRI S','Subadharaneeshs@gmail.com','student','student','student','2005-08-30','2026-08-12',1,1,1,'2025-08-12 16:22:51.216064',2022,2026,0);
INSERT INTO "users" VALUES(163,'22CS159','ksubha2005@gmail.com','pbkdf2:sha256:600000$uYOWuyCq0KplGaAB$4fba7617d042e33411d9a7539640e410ada2b8be0430c7a5091f04fd75df6e5c','SUBHA K','ksubha2005@gmail.com','student','student','student','2005-03-18','2026-08-12',1,1,1,'2025-08-12 16:22:51.505233',2022,2026,0);
INSERT INTO "users" VALUES(164,'22CS160','RANGASUDEE@GMAIL.COM','pbkdf2:sha256:600000$lklBIr85Ulsvi7Vz$453459e08ea60e0c93c4afa7b761310a4517f398901b9ea19372e41d64dec0cd','SUDEENDRA R','RANGASUDEE@GMAIL.COM','student','student','student','2004-11-25','2026-08-12',1,1,1,'2025-08-12 16:22:51.774043',2022,2026,0);
INSERT INTO "users" VALUES(165,'22CS161','Suganeshpsuganesh@gmail.com','pbkdf2:sha256:600000$3FqsdzSF7Rs06B8T$378e81c9c13b6128a95b46f09e6d46d67ec0a13ad6be06a16a413055c1c60150','SUGANESH P','Suganeshpsuganesh@gmail.com','student','student','student','2004-12-09','2026-08-12',1,1,1,'2025-08-12 16:22:52.055400',2022,2026,0);
INSERT INTO "users" VALUES(166,'22CS162','rajsunami369@gmail.com','pbkdf2:sha256:600000$YZoH0AiG0vdAaaEt$1ec90841e94a15255bd84bba99568f7f9e702b0155fc9bc0c0afcae4055e4199','SUNAMI RAJ','rajsunami369@gmail.com','student','student','student','2004-03-04','2026-08-12',1,1,1,'2025-08-12 16:22:52.342238',2022,2026,0);
INSERT INTO "users" VALUES(167,'22CS163','suryasnambiar0@gmail.com','pbkdf2:sha256:600000$Zwuhsy3wt0V3YlYc$7e35fef311a7a496ed4baf19d5d23ff9595257b62846614147789187e0624c09','SURYANARAYAN P P','suryasnambiar0@gmail.com','student','student','student','2005-02-20','2026-08-12',1,1,1,'2025-08-12 16:22:52.643458',2022,2026,0);
INSERT INTO "users" VALUES(168,'22cs164','swetharengasamy05@gmail.com','pbkdf2:sha256:600000$kHYKFZwHWKMri8Ej$126b6be20910fe2f99f64949d26a85040e0ac9149aee732f304bd6793c4cda53','SWETHA. R','swetharengasamy05@gmail.com','student','student','student','2005-03-24','2026-08-12',1,1,1,'2025-08-12 16:22:52.983379',2022,2026,0);
INSERT INTO "users" VALUES(169,'22CS165','tharachand9500@gmail.com','pbkdf2:sha256:600000$1CXN8ERn4Sct6Qdf$1c5fd6c45aef0ba58bea209a3d3cc99f80c66df807450af52ead3fdea7e2f301','THARACHAND K','tharachand9500@gmail.com','student','student','student','2005-05-04','2026-08-12',1,1,1,'2025-08-12 16:22:53.246750',2022,2026,0);
INSERT INTO "users" VALUES(170,'22CS166','thavanithimurugan@gmail.com','pbkdf2:sha256:600000$YMxIL5B8mNcf0w5S$70b0943f94bf2b55c4c6843d3f57ea76b401e00489bb9a3688a232328a8c63e5','THAVANITHI. M','thavanithimurugan@gmail.com','student','student','student','2005-06-18','2026-08-12',1,1,1,'2025-08-12 16:22:53.535653',2022,2026,0);
INSERT INTO "users" VALUES(171,'22cs167','thilagavathi3261@gmail.com','pbkdf2:sha256:600000$S5o9q7HDKNkzC3NL$9d8355d2f7c04bee9f1b11c4cddce7ca4704d64aaab72aca3787552f33f17e0e','THILAGAVATHI.A','thilagavathi3261@gmail.com','student','student','student','2004-10-12','2026-08-12',1,1,1,'2025-08-12 16:22:53.805348',2022,2026,0);
INSERT INTO "users" VALUES(172,'22CS168','thirumalaivasan793@gmail.com','pbkdf2:sha256:600000$gU5FPDfVNJjUIKSq$a26b21fa2ce23566fbed55700fdab3b37d9eee4df26ff0055b756e1f864f1cbd','THIRUMALAIVASAN D','thirumalaivasan793@gmail.com','student','student','student','2005-12-01','2026-08-12',1,1,1,'2025-08-12 16:22:54.068878',2022,2026,0);
INSERT INTO "users" VALUES(173,'22CS170','ujjwalkaushik1447uj@gmail.com','pbkdf2:sha256:600000$HqSlOojdNQhfSNtV$efdd6b0a307f9c2e1bf267e09cf577952b26c958d3f7349922bbf85c18706701','UJJWAL KAUSHIK','ujjwalkaushik1447uj@gmail.com','student','student','student','2005-08-29','2026-08-12',1,1,1,'2025-08-12 16:22:54.356870',2022,2026,0);
INSERT INTO "users" VALUES(174,'22CS171','vaishunevi4@gmail.com','pbkdf2:sha256:600000$j3Okapam773mryyN$b61429737aed5b53f9fd22b421ef9e787ffc6f9b7ef59f363cdf3bde96ab6f23','VAISHNAVI L R','vaishunevi4@gmail.com','student','student','student','2004-12-29','2026-08-12',1,1,1,'2025-08-12 16:22:54.658805',2022,2026,0);
INSERT INTO "users" VALUES(175,'22CS172','varshinithilagar@gmail.com','pbkdf2:sha256:600000$uIzdheklJ8x4InRB$b3b770578384a5bd021a716950f3bad3390e313d66a361ee6a4f6866f59da91f','VARSHINI T','varshinithilagar@gmail.com','student','student','student','2005-10-05','2026-08-12',1,1,1,'2025-08-12 16:22:54.929624',2022,2026,0);
INSERT INTO "users" VALUES(176,'22CS173','varshinigowsik@gmail.com','pbkdf2:sha256:600000$qOEbKePXoQik9K05$d9dc09f003b33927707c5ac7e64741d81cf5960f5a6d037d95345d35bea5a816','VARSHINI.V','varshinigowsik@gmail.com','student','student','student','2006-02-01','2026-08-12',1,1,1,'2025-08-12 16:22:55.199145',2022,2026,0);
INSERT INTO "users" VALUES(177,'22CS174','vasanthakumar21012005@gmail.com','pbkdf2:sha256:600000$yyHrbqBnsXZK5JvI$078f9f9d0a59ef63dad352e51dc09a8d62cd962bb4484a157654d6e8fba689df','VASANTHA KUMAR K','vasanthakumar21012005@gmail.com','student','student','student','2005-01-21','2026-08-12',1,1,1,'2025-08-12 16:22:55.468902',2022,2026,0);
INSERT INTO "users" VALUES(178,'22CS175','veenamurugan71@gmail.com','pbkdf2:sha256:600000$YU293RdYmaJg5v36$2027dd60e4efd60b9f6c750c50f1e016640b80e202918f28ee2ed8c5b5d62d54','VEENA.M','veenamurugan71@gmail.com','student','student','student','2004-06-15','2026-08-12',1,1,1,'2025-08-12 16:22:55.765704',2022,2026,0);
INSERT INTO "users" VALUES(179,'22cs176','Kabildavid001@gmail.com','pbkdf2:sha256:600000$LHZ6i6Me22tpnSln$7ed35a7ed4fca8d9ff0c17d32a0dedd2d77c7b09be73613402fcbc4c698344a3','VEERICHETTY R','Kabildavid001@gmail.com','student','student','student','2004-10-22','2026-08-12',1,1,1,'2025-08-12 16:22:56.040146',2022,2026,0);
INSERT INTO "users" VALUES(180,'22CS177','vickykumarchainpur@gmail.com','pbkdf2:sha256:600000$xh20RsWH8yZcajMZ$d589f667bf67a896ae43c93a9955e86dd000f4572e61bf48494e6a28f14d465e','VICKY KUMAR','vickykumarchainpur@gmail.com','student','student','student','2004-03-04','2026-08-12',1,1,1,'2025-08-12 16:22:56.358228',2022,2026,0);
INSERT INTO "users" VALUES(181,'22CS178','svijayalakshmi317@gmail.com','pbkdf2:sha256:600000$CUPWOzFmzuqBZBRL$f966e403b352772506cf24fc9be40f299e04379fb33df217a676d7d3fc15719f','VIJAYALAKSHMI S','svijayalakshmi317@gmail.com','student','student','student','2005-01-13','2026-08-12',1,1,1,'2025-08-12 16:22:56.674110',2022,2026,0);
INSERT INTO "users" VALUES(182,'22cs179','vijayaragavank9@gmail.com','pbkdf2:sha256:600000$37yv7u8QzI96okwq$265e3c2ca060d884ad7ca8c714b81cdc93fff321d8e3d661aa25b4e859b2d687','VIJAYARAGAVAN K','vijayaragavank9@gmail.com','student','student','student','2005-04-08','2026-08-12',1,1,1,'2025-08-12 16:22:56.992715',2022,2026,0);
INSERT INTO "users" VALUES(183,'22CS180','vijaysarathi1711@gmail.com','pbkdf2:sha256:600000$O0Ju4n2qXuXZ4f7U$07172db5f756e59bae2f5ab15515fca30c01e73837f0f160ab7e5ea2e643b208','VIJAYASARATHI R','vijaysarathi1711@gmail.com','student','student','student','2005-11-17','2026-08-12',1,1,1,'2025-08-12 16:22:57.278594',2022,2026,0);
INSERT INTO "users" VALUES(184,'22CS181','apvimalparamasivam@gmail.com','pbkdf2:sha256:600000$m9KDKzgMvWjQTPUQ$ddd5b2cf22952847b792a395000755b81485db9a754fffdeb2206326949bc799','VIMAL A.P','apvimalparamasivam@gmail.com','student','student','student','2005-04-18','2026-08-12',1,1,1,'2025-08-12 16:22:57.580944',2022,2026,0);
INSERT INTO "users" VALUES(185,'22cs182','vimalnambi@gmail.com','pbkdf2:sha256:600000$1iF7Q6A2gGo4L0Ex$19508670387e9df41995790c45b7c1d8f2ef654e8c88a5f9e1220dca471b88e9','VIMAL N.D','vimalnambi@gmail.com','student','student','student','2004-12-24','2026-08-12',1,1,1,'2025-08-12 16:22:57.870072',2022,2026,0);
INSERT INTO "users" VALUES(186,'22CS183','vickysaranvickysaran007@gmail.com','pbkdf2:sha256:600000$Jcv7poXz5jUjIQDP$97c1b17ea5e15afb535344617b3b65c1d497e39aa5418d89ac064816fb03c49f','VISHAL R','vickysaranvickysaran007@gmail.com','student','student','student','2005-06-06','2026-08-12',1,1,1,'2025-08-12 16:22:58.153953',2022,2026,0);
INSERT INTO "users" VALUES(187,'22CS184','vp4500013@gmail.com','pbkdf2:sha256:600000$zJDclj1icw7JaPgQ$a3a54a2c31fb958e473dde433c0b38e99df8b750cbb5c13fcbe3b9843b2a2d26','VISHNU PRIYA V','vp4500013@gmail.com','student','student','student','2005-01-20','2026-08-12',1,1,1,'2025-08-12 16:22:58.424615',2022,2026,0);
INSERT INTO "users" VALUES(188,'22CS185','vishwa07772@gmail.com','pbkdf2:sha256:600000$1GC6QB32YmD3QwEc$579e55c40782f6e46275ce95ac2a6c849d342f264dc8be2f113c0f1479683ce5','VISHWA. S. S','vishwa07772@gmail.com','student','student','student','2005-04-13','2026-08-12',1,1,1,'2025-08-12 16:22:58.706008',2022,2026,0);
INSERT INTO "users" VALUES(189,'22cs186','yogi96695@gmail.com','pbkdf2:sha256:600000$lAcXTxIpaiA3gvt1$9288f323934fe5eb771a761aa50a7f515cb61c9607cc3794150d1d2d04cff4a5','YOGESHKUMAR M','yogi96695@gmail.com','student','student','student','2005-08-15','2026-08-12',1,1,1,'2025-08-12 16:22:59.001391',2022,2026,0);
INSERT INTO "users" VALUES(190,'23LCS199','sakthisakthi66502@gmail.com','pbkdf2:sha256:600000$OEbqBDpelzNHxOK0$4471b8d18bfca4ddde89a951f0935bb6e75b5f24a1e2a037d12a60ddedc3f604','SAKTHI MURUGAN K','sakthisakthi66502@gmail.com','student','student','student','2003-03-12','2026-08-12',1,1,1,'2025-08-12 16:22:59.308423',2022,2026,0);
INSERT INTO "users" VALUES(191,'23LCS200','sanjainathan230220044@gmail.com','pbkdf2:sha256:600000$ZLVhVv4p6gYX6Hw4$e27310ea7daebf119a25b9f451b7b707a3ffd4b7caef79784d9e80b982180623','SANJAINATHAN.S','sanjainathan230220044@gmail.com','student','student','student','2004-02-23','2026-08-12',1,1,1,'2025-08-12 16:22:59.606853',2022,2026,0);
INSERT INTO "users" VALUES(192,'23LCS201','Sathyajothim06@gmail.com','pbkdf2:sha256:600000$U25ZydmUQg7NcxCq$c268dae254456f3fbfa2ef7874bbcf143421ac9eb64b2f307154d29725a9d8de','SATHYAJOTHI. N. M','Sathyajothim06@gmail.com','student','student','student','2001-10-30','2026-08-12',1,1,1,'2025-08-12 16:22:59.889333',2022,2026,0);
INSERT INTO "users" VALUES(193,'23LCS204','yuvayuva1412@gmail.com','pbkdf2:sha256:600000$d8rk09PdcRyZlwe9$eeff83c589579477fc32a199b1288c5e13f4039364f63ad51484ae2399fce010','YUVARAJ.M','yuvayuva1412@gmail.com','student','student','student','2001-12-14','2026-08-12',1,1,1,'2025-08-12 16:23:00.187636',2022,2026,0);
INSERT INTO "users" VALUES(194,'001','001','scrypt:32768:8:1$O4lkVSNg1wJN2InV$6bac1df2b5aca79d5490f29f043ad201e4d6158d9e373b12b00894b5f51ebf2660022c6af95a9615a2d2f1ffc3a6ec80070275033970bb75b29f16e06377a808','Ragavan','789@gmail.com','librarian','student','staff','1990-01-01','2030-12-31',NULL,NULL,1,'2025-09-02 04:52:34.056395',NULL,NULL,1);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_books_access_no ON books(access_no);
CREATE INDEX idx_circulations_status ON circulations(status);
COMMIT;
