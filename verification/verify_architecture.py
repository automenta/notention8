import os

def check_file_exists(filepath, should_exist=True):
    exists = os.path.exists(filepath)
    if should_exist and not exists:
        print(f"FAIL: Expected {filepath} to exist, but it does not.")
        return False
    if not should_exist and exists:
        print(f"FAIL: Expected {filepath} to NOT exist, but it does.")
        return False
    print(f"PASS: {filepath} {'exists' if should_exist else 'does not exist'} as expected.")
    return True

def verify_architecture():
    checks = [
        ("components/common/Icon.tsx", True),
        ("components/common/icons.tsx", True),
        ("components/layout/icons.tsx", False),
        ("components/MainView.tsx", True),
        ("components/layout/MainView.tsx", False),
        ("components/AppShell.tsx", True),
        ("components/layout/Layout.tsx", False),
        ("App.tsx", True)
    ]

    all_passed = True
    for filepath, should_exist in checks:
        if not check_file_exists(filepath, should_exist):
            all_passed = False

    if all_passed:
        print("Architecture verification PASSED.")
    else:
        print("Architecture verification FAILED.")
        exit(1)

if __name__ == "__main__":
    verify_architecture()
