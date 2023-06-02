create database if not exists SecureBand;

use SecureBand;

drop table if exists users;
drop table if exists children;
drop table if exists locations;
drop table if exists sessions;

create table if not exists users (
    user_id         int auto_increment primary key,
    email           varchar(64) not null unique,
    first_name      varchar(64) not null,
    last_name       varchar(64) not null,
    username        varchar(64) not null unique,
    password        varchar(64) not null,
    created_at      timestamp not null default current_timestamp
);

create table if not exists children (
    child_id          int auto_increment primary key,
    first_name        varchar(64) not null,
    last_name         varchar(64) not null,
    parent_id         int not null,
    created_at        timestamp not null default current_timestamp,
    FOREIGN KEY (parent_id) REFERENCES users(user_id)
);

create table if not exists locations (
    location_id     int auto_increment primary key,
    child_id        int not null,
    latitude        smallint not null,
    longitude       smallint not null,
    FOREIGN KEY (child_id) REFERENCES children(child_id)
);

create table if not exists sessions (
  session_id varchar(64) primary key,
  session_data json not null,
  created_at timestamp not null default current_timestamp
);
