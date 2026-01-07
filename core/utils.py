import zipfile
import os


def zip_directory(folder_path: str, zip_path: str):
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                full_path = os.path.join(root, file)
                zipf.write(
                    full_path,
                    arcname=os.path.relpath(full_path, folder_path)
                )
