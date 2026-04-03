import React, { useState, useRef } from 'react';
import { 
  TrendingUp, 
  Search, 
  Clock, 
  BarChart3, 
  ShieldAlert, 
  Target, 
  Zap, 
  Copy, 
  Check, 
  AlertCircle,
  Loader2,
  ChevronRight,
  LineChart,
  LayoutDashboard,
  History,
  ImagePlus,
  X,
  Upload
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeAsset, AnalysisResult } from './services/gemini';
import { cn } from './lib/utils';

const TIMEFRAMES = [
  '1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'
];

interface AnalysisHistory {
  asset: string;
  timeframe: string;
  result: AnalysisResult;
  timestamp: number;
  hasImage?: boolean;
}

export default function App() {
  const [asset, setAsset] = useState('');
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!asset.trim() && !selectedImage) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeAsset(asset, timeframe, selectedImage || undefined);
      if (analysis) {
        setResult(analysis);
        const newHistoryItem = {
          asset: asset || "تحليل صورة",
          timeframe,
          result: analysis,
          timestamp: Date.now(),
          hasImage: !!selectedImage
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
        
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setError('لم يتم استلام أي تحليل. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إجراء التحليل. تأكد من إعداد مفتاح API.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadFromHistory = (item: AnalysisHistory) => {
    setAsset(item.asset === "تحليل صورة" ? "" : item.asset);
    setTimeframe(item.timeframe);
    setResult(item.result);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-gray-100 font-sans selection:bg-sky-500/30" dir="rtl">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between flex-row-reverse md:flex-row">
          <div className="flex items-center gap-2 flex-row-reverse md:flex-row">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)] border border-sky-400/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white via-sky-400 to-purple-400 bg-clip-text text-transparent">
              STRATEGY ANALYST
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400 flex-row-reverse">
            <span className="hover:text-sky-400 cursor-pointer transition-all hover:glow-sky">SK</span>
            <span className="hover:text-orange-400 cursor-pointer transition-all hover:glow-orange">SMC</span>
            <span className="hover:text-green-400 cursor-pointer transition-all hover:glow-green">ADX</span>
            <span className="hover:text-purple-400 cursor-pointer transition-all hover:glow-purple">LARSI</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Sidebar: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-8 flex-row-reverse">
              <LayoutDashboard className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-black tracking-tight uppercase">لوحة التحكم الذكية</h2>
            </div>
            
            <form onSubmit={handleAnalyze} className="space-y-8">
              {/* Asset Input */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
                  <Search className="w-3 h-3" />
                  الأصل المالي
                </label>
                <input
                  type="text"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="BTC/USDT, GOLD, NVDA..."
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-gray-700 text-right font-bold"
                  dir="rtl"
                />
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
                  <ImagePlus className="w-3 h-3" />
                  تحليل لقطة شاشة (Screenshot)
                </label>
                
                <AnimatePresence mode="wait">
                  {!selectedImage ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all"
                    >
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-sky-500/20 transition-all">
                        <Upload className="w-6 h-6 text-gray-500 group-hover:text-sky-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-500 group-hover:text-sky-400">اضغط لرفع صورة الشارت</p>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-2xl overflow-hidden border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                    >
                      <img src={selectedImage} alt="Selected Chart" className="w-full h-40 object-cover" />
                      <button 
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Timeframe */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
                  <Clock className="w-3 h-3" />
                  الفريم الزمني
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black transition-all border uppercase",
                        timeframe === tf 
                          ? "bg-sky-600 border-sky-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]" 
                          : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                      )}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (!asset && !selectedImage)}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.97]",
                  loading || (!asset && !selectedImage)
                    ? "bg-gray-900 text-gray-700 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] border border-sky-400/50"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    تحليل الاستراتيجية الشاملة
                  </>
                )}
              </button>
            </form>
          </section>

          {/* History Section */}
          {history.length > 0 && (
            <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6 flex-row-reverse">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <History className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-black uppercase tracking-tight">السجل الذكي</h2>
                </div>
                <button 
                  onClick={clearHistory}
                  className="text-[10px] font-black uppercase text-gray-600 hover:text-red-400 transition-colors"
                >
                  مسح
                </button>
              </div>
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadFromHistory(item)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/40 hover:bg-white/5 border border-white/5 transition-all group text-right"
                    dir="rtl"
                  >
                    <div className="flex flex-col items-start text-right w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-300">{item.asset}</span>
                        {item.hasImage && <ImagePlus className="w-3 h-3 text-sky-500" />}
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase">{item.timeframe} • {new Date(item.timestamp).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-sky-400 transition-all rotate-180" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Content: Results */}
        <div className="lg:col-span-8 space-y-6" ref={scrollRef}>
          <AnimatePresence mode="wait">
            {!result && !loading && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[40px] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-purple-500/5" />
                <div className="w-24 h-24 bg-sky-500/10 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(14,165,233,0.1)] border border-sky-500/20 rotate-12">
                  <LineChart className="w-12 h-12 text-sky-500" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">نظام التحليل الاستراتيجي</h3>
                <p className="text-gray-500 max-w-md font-medium leading-relaxed">
                  قم برفع صورة للشارت أو أدخل اسم الأصل المالي للحصول على تحليل فني متكامل يجمع بين SK و SMC و ADX و LARSI.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 space-y-8"
              >
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin shadow-[0_0_30px_rgba(14,165,233,0.2)]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 className="w-10 h-10 text-sky-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black tracking-tight">جاري معالجة البيانات الاستراتيجية...</h3>
                  <p className="text-gray-500 font-bold animate-pulse">نقوم بدمج مدارس التحليل الفني المختلفة لبناء رؤية دقيقة</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-start gap-5 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
              >
                <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-black text-red-500 mb-2 text-lg uppercase tracking-tight">خطأ في النظام</h3>
                  <p className="text-red-200/60 font-medium leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-md shadow-2xl relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500" />
                
                <div className="bg-white/[0.02] px-8 py-6 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-1.5 bg-sky-500/10 text-sky-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-500/20">
                      تقرير استراتيجي شامل
                    </div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{asset || "تحليل صورة"} • {timeframe}</span>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-gray-500 hover:text-sky-400 flex items-center gap-2 text-xs font-black uppercase"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>

                {/* Technical Indicators Grid */}
                <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-8 flex-row-reverse">
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">المؤشرات الحية (Live Gauges)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* RSI Gauge */}
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-sky-500/30 transition-all">
                      <div className="flex items-center justify-between mb-4 flex-row-reverse">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">RSI (Relative Strength Index)</span>
                        <span className={cn(
                          "text-lg font-black",
                          Number(result.indicators.rsi) > 70 ? "text-red-400" : 
                          Number(result.indicators.rsi) < 30 ? "text-green-400" : "text-sky-400"
                        )}>
                          {result.indicators.rsi || '---'}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-[30%] right-[30%] bg-white/5 border-x border-white/10" />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.max(0, Number(result.indicators.rsi) || 0))}%` }}
                          className={cn(
                            "h-full transition-all duration-1000",
                            Number(result.indicators.rsi) > 70 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                            Number(result.indicators.rsi) < 30 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                          )}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] font-black text-gray-600 uppercase tracking-widest flex-row-reverse">
                        <span>تشبع شرائي</span>
                        <span>متعادل</span>
                        <span>تشبع بيعي</span>
                      </div>
                    </div>

                    {/* MACD Status */}
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between mb-4 flex-row-reverse">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">MACD (Momentum)</span>
                        <Zap className={cn(
                          "w-5 h-5",
                          result.indicators.macd?.includes('إيجابي') ? "text-green-400 animate-pulse" : "text-red-400"
                        )} />
                      </div>
                      <div className="flex items-center gap-3 flex-row-reverse">
                        <div className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border",
                          result.indicators.macd?.includes('إيجابي') ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                        )}>
                          {result.indicators.macd || 'غير محدد'}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">حالة الزخم الحالية بناءً على التقاطعات</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'ADX', value: result.indicators.adx },
                      { label: 'Stochastic', value: result.indicators.stochastic },
                      { label: 'MA20', value: result.indicators.ma20 },
                      { label: 'MA50', value: result.indicators.ma50 },
                      { label: 'MA100', value: result.indicators.ma100 },
                      { label: 'MA200', value: result.indicators.ma200 },
                    ].map((indicator, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:border-sky-500/30 transition-all">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1 group-hover:text-sky-400 transition-colors">{indicator.label}</span>
                        <span className="text-sm font-black text-gray-200">{indicator.value || '---'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-10 prose prose-invert prose-sky max-w-none" dir="rtl">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-4xl font-black text-white mb-8 border-b border-white/5 pb-6 tracking-tighter" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-black text-sky-400 mt-12 mb-6 flex items-center gap-3 tracking-tight" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-black text-gray-200 mt-8 mb-4 tracking-tight" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-400 leading-[1.8] mb-6 font-medium text-lg" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-4 mb-8 list-none pr-0" {...props} />,
                      li: ({node, ...props}) => (
                        <li className="flex items-start gap-3 before:content-[''] before:w-2 before:h-2 before:bg-sky-500 before:rounded-full before:mt-2.5 before:shrink-0" {...props} />
                      ),
                      strong: ({node, ...props}) => <strong className="text-white font-black" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-r-4 border-sky-500 bg-sky-500/5 px-8 py-6 rounded-l-2xl italic text-gray-200 my-8 shadow-inner" {...props} />
                      ),
                      code: ({node, ...props}) => (
                        <code className="bg-black/60 px-2 py-1 rounded-lg text-sky-300 font-mono text-sm border border-white/5" {...props} />
                      ),
                    }}
                  >
                    {result.report}
                  </ReactMarkdown>
                </div>

                {/* Strategic Indicators Footer */}
                <div className="bg-white/[0.02] p-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 group-hover:bg-sky-500/20 transition-all">
                      <Target className="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-600 font-black tracking-widest mb-1">الدقة (SK)</p>
                      <p className="text-sm font-black text-sky-400">عالية جداً</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 transition-all">
                      <ShieldAlert className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-600 font-black tracking-widest mb-1">المخاطرة (SMC)</p>
                      <p className="text-sm font-black text-orange-400">محسوبة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 group-hover:bg-green-500/20 transition-all">
                      <BarChart3 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-600 font-black tracking-widest mb-1">القوة (ADX)</p>
                      <p className="text-sm font-black text-green-400">ترند قوي</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                      <Zap className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-600 font-black tracking-widest mb-1">الزخم (LARSI)</p>
                      <p className="text-sm font-black text-purple-400">إيجابي</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-4 py-16 border-t border-white/5 text-center relative z-10">
        <div className="flex justify-center gap-8 mb-8">
          <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300" />
        </div>
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-4">
          نظام التحليل الاستراتيجي العالمي • مدعوم بالذكاء الاصطناعي الفائق
        </p>
        <p className="text-gray-700 text-[10px] max-w-2xl mx-auto leading-loose">
          إخلاء مسؤولية: كافة التحليلات المقدمة هي نتاج خوارزميات ذكاء اصطناعي متقدمة لأغراض تعليمية. التداول ينطوي على مخاطر عالية، يرجى دائماً استشارة مستشار مالي متخصص.
        </p>
      </footer>
    </div>
  );
}
