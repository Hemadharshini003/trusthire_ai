from app.routers.auth import pwd_context


def test_password_hashing():
    password = "TestPassword123"

    hashed = pwd_context.hash(password)

    assert hashed != password
    assert pwd_context.verify(password, hashed)


def test_wrong_password():
    password = "TestPassword123"
    wrong_password = "WrongPassword123"

    hashed = pwd_context.hash(password)

    assert not pwd_context.verify(wrong_password, hashed)