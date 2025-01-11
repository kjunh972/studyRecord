import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useBlocker } from 'react-router-dom'

interface PromptMessage {
  title: string;
  content: string;
  confirmText: string;
  cancelText?: string;
}

export function usePrompt(content: string, shouldPrompt: boolean) {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)
  const [nextLocation, setNextLocation] = useState<string | null>(null)
  const [isBlocking, setIsBlocking] = useState(false)
  
  const message: PromptMessage = {
    title: '페이지 이동 확인',
    content,
    confirmText: '나가기',
    cancelText: '취소'
  }

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (shouldPrompt) {
        e.preventDefault()
        return message.content
      }
    },
    [shouldPrompt, message.content]
  )

  const handleBlock = useCallback(
    ({ currentLocation, nextLocation }: { currentLocation: any, nextLocation: any }) => {
      if (shouldPrompt && !isBlocking && nextLocation.pathname !== currentLocation.pathname) {
        setIsBlocking(true)
        setShowDialog(true)
        setNextLocation(nextLocation.pathname)
        return true
      }
      return false
    },
    [shouldPrompt, isBlocking]
  )

  const handleConfirm = useCallback(() => {
    setShowDialog(false)
    setIsBlocking(false)
    if (nextLocation) {
      navigate(nextLocation)
    }
  }, [navigate, nextLocation])

  const handleCancel = useCallback(() => {
    setShowDialog(false)
    setIsBlocking(false)
    setNextLocation(null)
  }, [])

  useBlocker(handleBlock)

  useEffect(() => {
    if (shouldPrompt) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldPrompt, handleBeforeUnload])

  return {
    showDialog,
    handleCancel,
    handleConfirm,
    message
  }
} 