"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SafeImg } from "@/components/store/safe-img";
import { saveProduct } from "@/app/actions/store";
import { CURRENCIES } from "@/lib/store/format";
import { productSlug } from "@/lib/store/slug";
import type { ActionState } from "@/lib/actions/types";
import type { ProductFormValues } from "@/types/store";

const MAX_IMAGES = 8;

type Row = { key: number; value: string };

/**
 * Shared by /products/new and /products/[id].
 * Images are TEXT: one URL input per picture (paste the direct link from imgbb or any https host).
 * Order in this list = display order, first = cover. Nothing is uploaded anywhere.
 */
export function ProductForm({
  product,
  categories,
  username,
}: {
  product?: ProductFormValues;
  categories: { id: string; name: string }[];
  username: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => saveProduct(fd),
    undefined
  );

  // Slug follows the name while the owner has not touched it (new products only). Saved products keep
  // their link stable: renaming a product never silently changes a URL that may already be shared.
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.id));
  const shownSlug = slugTouched ? slug : productSlug(name);

  const [rows, setRows] = useState<Row[]>(() => (product?.images ?? []).map((value, key) => ({ key, value })));
  const [nextKey, setNextKey] = useState(rows.length);

  const add = () => {
    if (rows.length >= MAX_IMAGES) return;
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

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pf-name">Product name</Label>
        <Input id="pf-name" name="name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pf-slug">Product link</Label>
        <Input
          id="pf-slug"
          name="slug"
          maxLength={80}
          value={shownSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toLowerCase());
          }}
          placeholder="made-from-the-name"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className="break-all text-xs text-gray-500">
          Page address: /{username}/shop/<strong>{shownSlug || "..."}</strong>. English letters, numbers and hyphens. Leave it
          empty and one is made from the name.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-price">Price</Label>
          <Input
            id="pf-price"
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            defaultValue={product?.price}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-currency">Currency</Label>
          <Select id="pf-currency" name="currency" defaultValue={product?.currency ?? "BDT"}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pf-desc">Description</Label>
        <Textarea id="pf-desc" name="description" rows={4} maxLength={2000} defaultValue={product?.description} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-cat">Category</Label>
          <Select id="pf-cat" name="category_id" defaultValue={product?.category_id ?? ""}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {categories.length === 0 && (
            <p className="text-xs text-gray-500">Create categories on the Products page.</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-sort">Display order</Label>
          <Input id="pf-sort" name="sort_order" type="number" min="0" max="9999" defaultValue={product?.sort_order ?? 0} />
          <p className="text-xs text-gray-500">Lower numbers show first.</p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          Photos <span className="font-normal text-gray-500">({rows.length}/{MAX_IMAGES}, first one is the cover)</span>
        </legend>
        <p className="text-xs text-gray-500">
          Upload each photo to imgbb.com, then paste its <strong>direct link</strong> (it starts with https://i.ibb.co/).
        </p>

        {rows.map((row, i) => {
          const valid = row.value.startsWith("https://");
          return (
            <div key={row.key} className="flex items-center gap-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-input bg-brand-light/20">
                {valid ? (
                  <SafeImg
                    key={row.value}
                    src={row.value}
                    alt=""
                    className="h-full w-full object-cover"
                    fallback={<ImageIcon className="h-5 w-5 text-red-400" />}
                  />
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
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move photo up"
                  className="flex h-11 w-9 items-center justify-center rounded-md hover:bg-brand-light/30 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === rows.length - 1}
                  aria-label="Move photo down"
                  className="flex h-11 w-9 items-center justify-center rounded-md hover:bg-brand-light/30 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.key)}
                  aria-label="Remove photo"
                  className="flex h-11 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        <Button type="button" variant="outline" onClick={add} disabled={rows.length >= MAX_IMAGES} className="h-11 w-fit">
          <Plus className="h-4 w-4" /> Add photo link
        </Button>
      </fieldset>

      <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product?.is_active ?? true}
          className="h-5 w-5 accent-[#2f9a42]"
        />
        Visible in my store
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="h-11 px-6">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {product?.id ? "Save changes" : "Add product"}
        </Button>
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {state.error}
          </p>
        )}
        {state?.success && <p className="text-sm font-medium text-brand-deep">Saved ✓</p>}
      </div>
    </form>
  );
}
