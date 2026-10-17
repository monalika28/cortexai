import { Code2, FileText, Globe, ImageIcon, MessageSquare, Mic, MicOff, Paperclip, Presentation, Send, X, Zap } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setIsLoading, setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'

function ChatInput() {
  const [value, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages, isLoading } = useSelector(state => state.message)
  const [selectedFile, setSelectedFile] = useState(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = ""
      for (let index = event.resultIndex; index < event.results.length; index++) {
        transcript += event.results[index][0].transcript
      }
      setValue(transcript)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("speech recognition not supported")
      return;
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  // File select handler with automatic Agent selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      if (file.type.startsWith("image/")) {
        setSelectedAgent("Vision")
      } else if (file.type === "application/pdf") {
        setSelectedAgent("PDF")
      }
    }
  }

  const handleSendMessage = async () => {
    if (!value.trim() && !selectedFile) return;
    if (isLoading) return;

    dispatch(setIsLoading(true))
    let conversation = selectedConversation
    if (!conversation) {
      dispatch(setMessages([]))
      const conv = await createConversation()
      dispatch(setSelectedConversation(conv))
      dispatch(addConversation(conv))
      conversation = conv
    }

    if (conversation?.title === "New Chat" && value.trim()) {
      await updateConversation({ id: conversation?._id, title: value.trim() })
      dispatch(setConvTitle({ conversationId: conversation?._id, title: value.slice(0, 40) }))
    }

    const formData = new FormData()
    formData.append("prompt", value.trim())
    formData.append("conversationId", conversation?._id)
    formData.append("agent", selectedAgent.toLowerCase())
    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    dispatch(addMessage({ 
      role: "user", 
      content: value.trim(),
      images: selectedFile && selectedFile.type.startsWith("image/") ? [URL.createObjectURL(selectedFile)] : [] 
    }))
    
    setValue("")
    const fileToClear = selectedFile
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ""

    try {
      const data = await sendMessage(formData)
      dispatch(setArtifacts(data?.artifacts || []))
      dispatch(addMessage({ role: "assistant", content: data?.answer, images: data?.images }))
    } catch (error) {
      console.error("Send message error:", error)
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const agents = [
    { id: "auto", icon: Zap, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "PDF" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "vision", icon: ImageIcon, label: "Vision" },
    { id: "search", icon: Globe, label: "Search" }
  ]

  return (
    <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]'>
      <div className='flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3'>

        {/* Agent Selectors */}
        <div className='flex w-full gap-2 pr-2 flex-wrap'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`flex-shrink-0 cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-slate-500"} />
                {agent.label}
              </div>
            )
          })}
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className='my-2'>
            <div className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2'>
              {selectedFile?.type === "application/pdf" ? (
                <FileText size={18} className="text-red-400 shrink-0" />
              ) : selectedFile?.type?.startsWith("image/") ? (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="preview" 
                  className="h-9 w-9 rounded-lg object-cover" 
                />
              ) : null}

              <div className='min-w-0'>
                <p className='text-xs text-white truncate max-w-[180px]'>
                  {selectedFile?.name}
                </p>
                <p className='text-[10px] text-slate-500'>
                  {Math.ceil(selectedFile.size / 1024)} KB
                </p>
              </div>

              <button 
                className='ml-2 p-1 text-slate-500 hover:text-white transition-colors' 
                onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = "" }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          placeholder='Ask Anything... (Press Enter to send, Shift+Enter for new line)'
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          value={value}
          disabled={isLoading}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />

        {/* Bottom Actions */}
        <div className='flex items-center justify-between pt-1'>
          <div className='flex items-center gap-1'>
            <input 
              type="file" 
              accept='.pdf,image/*' 
              hidden 
              ref={fileRef} 
              onChange={handleFileSelect} 
            />

            <button 
              type="button"
              className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer' 
              onClick={() => fileRef.current?.click()}
              title="Attach File"
            >
              <Paperclip size={16} />
            </button>

            <button
              type="button"
              onClick={toggleMic}
              title="Voice Input"
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 cursor-pointer ${
                listening ? "bg-red-500 text-white animate-pulse" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]"
              }`}
            >
              {listening ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
          </div>

          <button
            type="button"
            disabled={(!value.trim() && !selectedFile) || isLoading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 ${
              (value.trim() || selectedFile) && !isLoading
                ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white shadow-sm"
                : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput