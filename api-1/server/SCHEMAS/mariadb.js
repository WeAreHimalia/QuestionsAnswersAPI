CREATE IF NOT EXISTS product_id (
  id INT NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS questions (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  question_body TEXT NOT NULL,
  question_date DATETIME NOT NULL,
  asker_name VARCHAR(50),
  question_helpfulness INT NOT NULL,
  reported BOOLEAN NOT NULL,
  product_id INT NOT NULL,
  CONSTRAINT `fk_connect_product_id`
    FOREIGN KEY (product_id) REFERENCES product_id (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS answers (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  body TEXT NOT NULL,
  date DATETIME NOT NULL,
  answerer_name VARCHAR(50),
  helpfulness INT NOT NULL,
  question_id INT NOT NULL,
  CONSTRAINT `fk_connect_question_id`
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT
);

CREATE TABLE IF NOT EXISTS answer_photos (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  photo_url TEXT,
  answer_id INT NOT NULL,
  CONSTRAINT `fk_connect_answer_id`
    FOREIGN KEY (answer_id) REFERENCES answers (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT
);