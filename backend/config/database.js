const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL接続プール設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Supabaseでは必須
  }
});

// 接続成功時のログ
pool.on('connect', (client) => {
  console.log('✅ PostgreSQL データベースに接続しました');
  console.log(`📍 接続先: ${client.host}:${client.port}`);
});

// 接続エラー時のログ
pool.on('error', (err, client) => {
  console.error('❌ PostgreSQL 接続エラー:', err.message);
  console.error('🔧 接続情報を確認してください');
});

// データベース接続テスト関数
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🧪 データベース接続テスト開始...');
    
    // 簡単なクエリでテスト
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ データベース接続テスト成功！');
    console.log('⏰ データベース時刻:', result.rows[0].current_time);
    console.log('🗄️ PostgreSQL バージョン:', result.rows[0].pg_version.split(' ')[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ データベース接続テスト失敗:', error.message);
    console.error('🔧 .envファイルのDATABASE_URLを確認してください');
    return false;
  }
};

// テーブル存在確認関数
const checkTables = async () => {
  try {
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await pool.query(tablesQuery);
    const tableNames = result.rows.map(row => row.table_name);
    
    console.log('📋 データベース内のテーブル一覧:');
    if (tableNames.length === 0) {
      console.log('   ⚠️  テーブルが見つかりません');
      console.log('   🔧 Supabaseでテーブルを作成してください');
    } else {
      tableNames.forEach(name => console.log(`   ✅ ${name}`));
    }
    
    return tableNames;
  } catch (error) {
    console.error('❌ テーブル確認エラー:', error.message);
    return [];
  }
};

// ユーザー数確認関数（テスト用）
const getUserCount = async () => {
  try {
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    const count = parseInt(result.rows[0].user_count);
    console.log(`👥 現在の登録ユーザー数: ${count}名`);
    return count;
  } catch (error) {
    console.error('❌ ユーザー数取得エラー:', error.message);
    console.log('   ℹ️  usersテーブルが存在しない可能性があります');
    return 0;
  }
};

module.exports = {
  pool,
  testConnection,
  checkTables,
  getUserCount
};