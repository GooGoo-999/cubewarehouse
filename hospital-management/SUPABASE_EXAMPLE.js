// 올바른 Supabase 클라이언트 사용 예시

import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 URL과 키를 가져옴
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase 클라이언트 생성 (문자열을 따옴표로 감싸야 함)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// accounts 테이블에서 데이터 조회
const { data, error } = await supabase
  .from('accounts')
  .select('*')

if (error) {
  console.error('Error:', error)
} else {
  console.log('Data:', data)
}

// 특정 사용자 조회
const { data: user, error: userError } = await supabase
  .from('accounts')
  .select('*')
  .eq('username', 'admin')
  .single()

// 새 계정 추가
const { data: newUser, error: insertError } = await supabase
  .from('accounts')
  .insert([
    {
      username: 'testuser',
      name: '테스트 사용자',
      password: 'password123',
      role: 'user'
    }
  ])
  .select()

// 계정 업데이트
const { data: updatedUser, error: updateError } = await supabase
  .from('accounts')
  .update({ name: '업데이트된 이름' })
  .eq('username', 'testuser')
  .select()

// 계정 삭제
const { error: deleteError } = await supabase
  .from('accounts')
  .delete()
  .eq('username', 'testuser')
