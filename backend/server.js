const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { testConnection, checkTables, getUserCount } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
app.use(helmet()); // セキュリティヘッダー設定
app.use(morgan('combined')); // リクエストログ記録

// CORS設定（フロントエンドからのリクエストを許可）
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// JSON解析ミドルウェア
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント（サーバーが正常に動作しているか確認用）
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Word Highlighter API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 基本的なルート（ルートアクセス時）
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Word Highlighter API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      words: '/api/words/*'
    }
  });
});

// テスト用のシンプルなAPI
app.get('/api/test', (req, res) => {
  res.json({
    message: 'テストAPIが正常に動作しています',
    timestamp: new Date().toISOString(),
    requestHeaders: req.headers
  });
});

// データベース接続テスト用エンドポイント
app.get('/api/database/test', async (req, res) => {
  try {
    const { testConnection, checkTables, getUserCount } = require('./config/database');
    
    console.log('🧪 データベーステストAPI呼び出し');
    
    const isConnected = await testConnection();
    const tables = await checkTables();
    const userCount = await getUserCount();
    
    res.json({
      status: isConnected ? 'connected' : 'disconnected',
      message: isConnected ? 'データベース接続成功' : 'データベース接続失敗',
      tables: tables,
      userCount: userCount,
      timestamp: new Date().toISOString(),
      host: req.get('host'),
      connectionInfo: {
        hasConfigFile: require('fs').existsSync('./config/database.js'),
        envDatabaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定'
      }
    });
  } catch (error) {
    console.error('❌ データベーステストAPIエラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'データベーステストでエラーが発生',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 404エラーハンドリング（存在しないエンドポイントへのアクセス）
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'エンドポイントが見つかりません',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/test'
    ]
  });
});

// エラーハンドリングミドルウェア
app.use((error, req, res, next) => {
  console.error('🚨 サーバーエラー:', error);
  
  // 開発環境では詳細なエラー情報を返す
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ 
      error: 'サーバー内部エラーが発生しました',
      details: error.message,
      stack: error.stack
    });
  } else {
    // 本番環境では簡潔なエラーメッセージのみ
    res.status(500).json({ 
      error: 'サーバー内部エラーが発生しました' 
    });
  }
});



// データベース初期化関数
const initializeDatabase = async () => {
  console.log('🗄️ データベース初期化開始...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ データベース接続に失敗しました');
    console.error('🔧 .env ファイルのDATABASE_URLを確認してください');
    // 接続失敗でもサーバーは起動させる（開発段階では便利）
    console.log('⚠️  データベース無しでサーバーを起動します');
    return false;
  }
  
  await checkTables();
  await getUserCount();
  
  console.log('✅ データベース初期化完了');
  return true;
};

// サーバー起動
const startServer = async () => {
  try {
    // データベース初期化（エラーでも続行）
    await initializeDatabase();
    
    // サーバー起動
    app.listen(PORT, () => {
      console.log('🚀============================================🚀');
      console.log(`🌟 Word Highlighter API Server Started! 🌟`);
      console.log('🚀============================================🚀');
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
      console.log(`🗄️ Database Test: http://localhost:${PORT}/api/database/test`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log('🚀============================================🚀');
    });
  } catch (error) {
    console.error('❌ サーバー起動エラー:', error);
    process.exit(1);
  }
};

// サーバー起動実行
startServer();

// Graceful shutdown (優雅な終了処理)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});