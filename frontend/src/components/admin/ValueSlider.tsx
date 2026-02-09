interface ValueSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const TICK_LABELS = ['0', '1', '2', '3', '4', '5'];

export default function ValueSlider({ value, onChange, label }: ValueSliderProps) {
  return (
    <div className="flex-1">
      {label && (
        <span className="text-xs text-gray-500 mb-0.5 block">{label}</span>
      )}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="value-slider flex-1"
        />
        <span className="text-sm font-medium text-gray-700 w-4 text-center tabular-nums">
          {value}
        </span>
      </div>
      <div className="flex justify-between px-[2px] mt-0.5">
        {TICK_LABELS.map((t) => (
          <span key={t} className="text-[10px] text-gray-300 w-3 text-center">{t}</span>
        ))}
      </div>
    </div>
  );
}
