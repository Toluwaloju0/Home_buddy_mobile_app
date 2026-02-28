""" a module to create a password hasher for all my passwords """

from argon2 import PasswordHasher

ph = PasswordHasher(hash_len=50, salt_len=50)
