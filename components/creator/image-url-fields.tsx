"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeImg } from "@/components/store/safe-img";

type Row = { key: number; value: string };

/**
 * Image links as TEXT inputs (name="image_url", in display order; first = cover). Paste direct https links
 * from imgbb or any host. Nothing is uploaded anywhere.
 */
export function ImageUrlFields({ initial, max = 8 }: { initial: string[]; max?: number }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((value, key) => ({ key, value })));
  const [nextKey, setNextKey] = useState(rows.length);

  const add = () => {
    if (rows.length >= max) return;
    setRows((r) => [...r, { key: nextKey, value: "" }]);
    setNextKey((k) => k + 1);
  };
  const remove = (key: number) => setRows((r) => r.filter((x) => x.key !== key));
  const setValue = (key: number, value: string) => setRows((r) => r.map((x) => (x.key === key ? { ...x, value } : x)));
  const move = (index: number, dir: -1 | 1) =>
    setRows((r) => {
      const j = index + dir;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });

  const btn = "flex h-11 w-9 items-center justify-center rounded-md hover:bg-brand-light/30 disabled:opacity-30";

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">
        Photos <span className="font-normal text-gray-500">({rows.length}/{max}, first one is the cover)</span>
      </legend>
      <p className="text-xs text-gray-500">
        Upload each photo to imgbb.com, then paste its <strong>direct link</strong> (it starts with https://i.ibb.co/).
      </p>

      {rows.map((row, i) => (
        <div key={row.key} className="flex items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-input bg-brand-light/20">
            {row.value.startsWith("https://") ? (
              <SafeImg key={row.value} src={row.value} alt="" className="h-full w-full object-cover" fallback={<ImageIcon className="h-5 w-5 text-red-400" />} />
            ) : (
              <ImageIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <Input
            name="image_url"
            type="url"
            inputMode="url"
            value={row.value}
            onChange={(e) => setValue(row.key, e.target.value)}
            placeholder="https://i.ibb.co/..."
            aria-label={`Photo ${i + 1} link`}
            maxLength={1000}
            className="h-11 min-w-0 flex-1"
          />
          <div className="flex shrink-0">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move photo up" className={btn}>
              <ArrowUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move photo down" className={btn}>
              <ArrowDown className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => remove(row.key)} aria-label="Remove photo" className={`${btn} text-red-600 hover:bg-red-50`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} disabled={rows.length >= max} className="h-11 w-fit">
        <Plus className="h-4 w-4" /> Add photo link
      </Button>
    </fieldset>
  );
}
