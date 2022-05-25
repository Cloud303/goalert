-- +migrate Up

ALTER TABLE auth_subjects
ADD COLUMN email TEXT;

-- +migrate Down

ALTER TABLE auth_subjects
DROP COLUMN email;
