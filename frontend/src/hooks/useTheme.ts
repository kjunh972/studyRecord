import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // 로컬 스토리지에서 테마 확인
    const savedTheme = localStorage.getItem('theme')
    
    // 시스템 다크모드 설정 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // 저장된 테마가 있으면 그것을 사용, 없으면 시스템 설정 사용
    if (savedTheme) {
      return savedTheme as 'dark' | 'light'
    }
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setTheme(isDark ? 'dark' : 'light')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // 테마 변경 시 로컬 스토리지 업데이트
    localStorage.setItem('theme', theme)
    
    // HTML root 요소에 dark 클래스 토글
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return { theme }
} 