import { useMemo, useRef, useState } from 'react';
import { Smartphone, RotateCw, RefreshCw, ExternalLink } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// پیش‌نمایش موبایل: سایت را داخل یک قاب واقعیِ گوشی (iframe) نمایش می‌دهد تا مدیر
// بتواند دقیقاً مثل یک گوشی موبایل ظاهر سایت را ببیند. چون کل اپ با HashRouter
// اجرا می‌شود، با باز کردن همان index.html داخل iframe یک نمونهٔ تازه از سایت روی
// مسیر انتخاب‌شده بوت می‌شود و تغییرات منتشرشده (از localStorage هم‌مبدأ) هم دیده می‌شود.
// ─────────────────────────────────────────────────────────────────────────────

type Device = {
  id: string;
  label: string;
  width: number;
  height: number;
  // شعاع گردیِ قاب و وجود ناچ برای ظاهر واقعی‌تر
  radius: number;
  notch: boolean;
};

const DEVICES: Device[] = [
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667, radius: 44, notch: false },
  { id: 'iphone-13', label: 'iPhone 13/14', width: 390, height: 844, radius: 52, notch: true },
  { id: 'iphone-pro-max', label: 'iPhone 15 Pro Max', width: 430, height: 932, radius: 56, notch: true },
  { id: 'pixel-7', label: 'Pixel 7', width: 412, height: 915, radius: 40, notch: false },
  { id: 'galaxy-s8', label: 'Galaxy S8+', width: 360, height: 740, radius: 44, notch: false },
];

// مسیرهای رایج سایت که می‌توان داخل پیش‌نمایش باز کرد.
const ROUTES: { path: string; label: string }[] = [
  { path: '#/', label: 'صفحهٔ اصلی' },
  { path: '#/support', label: 'پشتیبانی' },
  { path: '#/track', label: 'پیگیری رزرو' },
  { path: '#/login', label: 'ورود / ثبت‌نام' },
  { path: '#/account', label: 'پنل کاربری' },
];

// آدرس پایهٔ سند فعلی بدون هش (روی dev و GitHub Pages هر دو درست کار می‌کند).
function baseDocUrl(): string {
  return window.location.href.split('#')[0];
}

export default function MobilePreviewPanel() {
  const [deviceId, setDeviceId] = useState<string>('iphone-13');
  const [landscape, setLandscape] = useState(false);
  const [route, setRoute] = useState<string>('#/');
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const device = useMemo(
    () => DEVICES.find((d) => d.id === deviceId) ?? DEVICES[1],
    [deviceId],
  );

  // در حالت افقی عرض و ارتفاع جابه‌جا می‌شوند.
  const frameW = landscape ? device.height : device.width;
  const frameH = landscape ? device.width : device.height;

  const src = useMemo(
    () => `${baseDocUrl()}${route}`,
    // reloadKey باعث می‌شود با هر رفرش src تازه ساخته شود
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [route, reloadKey],
  );

  const reload = () => setReloadKey((k) => k + 1);
  const openInNewTab = () => window.open(src, '_blank');

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          نمایش موبایل
        </h2>
        <p className="text-xs text-gray-500">
          ظاهر سایت را دقیقاً مثل صفحهٔ یک گوشی موبایل ببینید.
        </p>
      </div>

      {/* نوار کنترل‌ها */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-3">
        {/* انتخاب مدل گوشی */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">مدل گوشی:</label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.width}×{d.height})
              </option>
            ))}
          </select>
        </div>

        {/* انتخاب صفحه */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">صفحه:</label>
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {ROUTES.map((r) => (
              <option key={r.path} value={r.path}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mr-auto">
          <button
            onClick={() => setLandscape((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
            title="چرخش صفحه"
          >
            <RotateCw className="w-4 h-4" />
            {landscape ? 'عمودی' : 'افقی'}
          </button>
          <button
            onClick={reload}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
            title="بارگذاری مجدد"
          >
            <RefreshCw className="w-4 h-4" />
            رفرش
          </button>
          <button
            onClick={openInNewTab}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            title="باز کردن در تب جدید"
          >
            <ExternalLink className="w-4 h-4" />
            تب جدید
          </button>
        </div>
      </div>

      {/* قاب گوشی */}
      <div className="flex justify-center py-6 bg-gradient-to-b from-gray-100 to-gray-50 rounded-2xl border border-gray-100 overflow-auto">
        <div
          className="relative bg-black shadow-2xl shrink-0"
          style={{
            width: frameW + 24,
            height: frameH + 24,
            borderRadius: device.radius + 12,
            padding: 12,
          }}
        >
          {/* ناچ (در صورت داشتن) */}
          {device.notch && !landscape && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-black rounded-b-2xl"
              style={{ width: Math.min(160, frameW * 0.45), height: 26 }}
            />
          )}

          {/* صفحهٔ نمایش */}
          <div
            className="relative w-full h-full overflow-hidden bg-white"
            style={{ borderRadius: device.radius }}
          >
            <iframe
              key={`${device.id}-${landscape ? 'l' : 'p'}-${reloadKey}-${route}`}
              ref={iframeRef}
              src={src}
              title="پیش‌نمایش موبایل سایت"
              className="w-full h-full border-0 bg-white"
              // اطمینان از اینکه iframe دقیقاً عرض گوشی را به عنوان viewport ببیند
              style={{ width: frameW, height: frameH }}
            />
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        اندازهٔ صفحه: {frameW}×{frameH} پیکسل — {device.label}
        {landscape ? ' (افقی)' : ''}
      </p>
    </div>
  );
}
