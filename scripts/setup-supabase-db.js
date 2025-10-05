#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://aluaeysdedzxhowxytvs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdWFleXNkZWR6eGhvd3h5dHZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwNjc0NiwiZXhwIjoyMDc1MDgyNzQ2fQ.CNZ07yC3o-BvczJBMUnXXoDPORUmpSmO_PToklZFsmk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    console.log('================================================================================');
    console.log('🗄️  Mo7ami Supabase Database Setup');
    console.log('================================================================================\n');

    const sqlCommands = [
        {
            name: 'Enable pgvector extension',
            sql: 'CREATE EXTENSION IF NOT EXISTS vector;'
        },
        {
            name: 'Create legal_documents table',
            sql: `
                CREATE TABLE IF NOT EXISTS legal_documents (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    title_ar TEXT,
                    domain TEXT NOT NULL,
                    language TEXT NOT NULL,
                    official_ref TEXT NOT NULL,
                    publication_date TIMESTAMP,
                    content TEXT,
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `
        },
        {
            name: 'Create document_chunks table',
            sql: `
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL,
                    content TEXT NOT NULL,
                    language TEXT NOT NULL,
                    article_number TEXT,
                    embedding vector(1536),
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `
        },
        {
            name: 'Create indexes',
            sql: `
                CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
                CREATE INDEX IF NOT EXISTS idx_chunks_language ON document_chunks(language);
                CREATE INDEX IF NOT EXISTS idx_documents_domain ON legal_documents(domain);
            `
        }
    ];

    for (const cmd of sqlCommands) {
        try {
            console.log(`\n🔧 ${cmd.name}...`);
            const { data, error } = await supabase.rpc('exec_sql', { query: cmd.sql });

            if (error) {
                console.log(`   ⚠️  ${error.message}`);
                console.log('   (This might be expected if tables already exist)');
            } else {
                console.log(`   ✅ Success`);
            }
        } catch (err) {
            console.log(`   ℹ️  Note: ${err.message}`);
        }
    }

    console.log('\n================================================================================');
    console.log('✅ Database setup process complete!');
    console.log('================================================================================\n');
    console.log('📋 Next steps:');
    console.log('1. Verify tables in Supabase Dashboard → Table Editor');
    console.log('2. Run: python3 scripts/ingest-to-database.py');
    console.log('\n');
}

setupDatabase().catch(console.error);
