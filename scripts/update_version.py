import json
import toml
import time

print("请确认你还未commit")
time.sleep(1)

# 0. 读取 package.json 获取最新版本号
with open("package.json", "r", encoding="utf-8") as f:
    pkg = json.load(f)
    last_version = pkg["version"]


while True:
    match input(
        f"当前版本: {last_version}\n请选择更新幅度:\n1. major\n2. minor\n3. patch\n请选择 (1/2/3):"
    ):
        case "1":
            new_version = f"{int(last_version.split('.')[0]) + 1}.0.0"
            break
        case "2":
            new_version = (
                f"{last_version.split('.')[0]}.{int(last_version.split('.')[1]) + 1}.0"
            )
            break
        case "3":
            new_version = f"{last_version.split('.')[0]}.{last_version.split('.')[1]}.{int(last_version.split('.')[2]) + 1}"
            break
        case _:
            print("未知的输入，请重新输入")
            continue

print(f"🚀 正在将版本号同步为: {new_version}")

# 1. 更新 package.json
with open("package.json", "w", encoding="utf-8") as f:
    pkg["version"] = new_version
    json.dump(pkg, f, indent=2, ensure_ascii=False)

# 2. 更新 tauri.conf.json
tauri_path = "src-tauri/tauri.conf.json"
with open(tauri_path, "r", encoding="utf-8") as f:
    tauri_conf = json.load(f)
tauri_conf["version"] = new_version
with open(tauri_path, "w", encoding="utf-8") as f:
    json.dump(tauri_conf, f, indent=2, ensure_ascii=False)

# 3. 更新 Cargo.toml
cargo_path = "src-tauri/Cargo.toml"
with open(cargo_path, "r", encoding="utf-8") as f:
    cargo_content = toml.load(cargo_path)
cargo_content["package"]["version"] = new_version
with open(cargo_path, "w", encoding="utf-8") as f:
    toml.dump(cargo_content, f)

# 4. 手动 commit 并手动 push
print(f"✅ 你现在可以进行commit并git tag v{new_version} && git push origin v{new_version}来完成release啦！")
