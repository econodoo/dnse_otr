#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "🚀 [DNSE_OTR] Đang biên dịch giao diện Web Cockpit..."
cd "$DIR/web"
npm run build

echo "📦 [DNSE_OTR] Đồng bộ hóa tài nguyên vào Android assets..."
mkdir -p "$DIR/android/app/src/main/assets/www"
rm -rf "$DIR/android/app/src/main/assets/www"/*
cp -r "$DIR/web/dist"/* "$DIR/android/app/src/main/assets/www/"

echo "✅ [DNSE_OTR] Hoàn tất đồng bộ! Sẵn sàng chạy trên xe và máy tính bảng."
