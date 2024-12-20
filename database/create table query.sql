
CREATE TABLE user (
    user_id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(500) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_img VARCHAR(255),
    PRIMARY KEY (user_id),
    UNIQUE INDEX unique_username (username ASC),
    UNIQUE INDEX unique_email (email ASC)
);

CREATE TABLE content (
    content_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,  -- user_id 컬럼 추가
    type ENUM('link', 'text', 'image') NOT NULL,
    original_url VARCHAR(1000) NOT NULL,
    short_url VARCHAR(255) NOT NULL,
    hit INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_hit_at TIMESTAMP,
    PRIMARY KEY (content_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE text_content (
	text_content_id int PRIMARY KEY AUTO_INCREMENT NOT NULL ,
    text TEXT NOT NULL,
    content_id int NOT NULL,
    FOREIGN KEY (content_id) REFERENCES content(content_id)
)
