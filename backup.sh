#!/bin/bash
# Script otomatis untuk mem-backup kodingan aplikasi

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-tester-$TIMESTAMP.zip"

echo "Memulai proses backup ke file: $BACKUP_NAME ⏳"
zip -r $BACKUP_NAME src/ api/ package.json package-lock.json vite.config.js index.html -x "**/node_modules/*"

echo "✅ Backup selesai! Kodingan aman di dalam file: $BACKUP_NAME"
echo "Jika ada error, cukup ekstrak file zip tersebut untuk me-rollback (restore)."