/**
 * The crafting rules (first used by Pollution Solution Squad): a backpack of
 * materials, recipes that need some of them, and blueprints with two or three
 * designs to choose from. Pure: no drawing, so every rule is unit tested.
 *
 * The engineering loop the game teaches is built in: a design is chosen
 * against the problem's goals and limits, built, tested in the world (its
 * result says how well it worked and why), and can be taken down to get the
 * materials back and try a better design.
 */

/** How many of each material you carry, by id. */
export type Inventory = Record<string, number>;

/** How well a design works when it is tested. */
export type Outcome = 'works' | 'half' | 'fails';

export interface Design {
  id: string;
  name: string;
  /** What is different about it, in a few words (shown on its card). */
  note: string;
  outcome: Outcome;
  /** What the test shows, and why (one or two short sentences). */
  why: string;
}

export interface Recipe {
  id: string;
  name: string;
  /** Materials used, by id. */
  needs: Inventory;
  /** What the fix must do. */
  goals: string[];
  /** What we have to work with. */
  limits: string[];
  /** The designs to choose from (a recipe with one design has no choice to make). */
  designs: Design[];
}

export function count(inv: Inventory, id: string): number {
  return inv[id] ?? 0;
}

/** A copy of the backpack with `n` more of a material. */
export function add(inv: Inventory, id: string, n = 1): Inventory {
  return { ...inv, [id]: count(inv, id) + n };
}

/** What is still missing to make a recipe (empty when you can make it). */
export function missing(inv: Inventory, r: Recipe): Inventory {
  const out: Inventory = {};
  for (const [id, n] of Object.entries(r.needs)) if (count(inv, id) < n) out[id] = n - count(inv, id);
  return out;
}

export function canCraft(inv: Inventory, r: Recipe): boolean {
  return Object.keys(missing(inv, r)).length === 0;
}

/** Use the materials for a recipe. Throws if something is missing (check canCraft first). */
export function craft(inv: Inventory, r: Recipe): Inventory {
  if (!canCraft(inv, r)) throw new Error(`Missing materials for ${r.id}`);
  const out = { ...inv };
  for (const [id, n] of Object.entries(r.needs)) out[id] = count(out, id) - n;
  return out;
}

/** Take a built fix down again: the materials come back, so you can try another design. */
export function takeDown(inv: Inventory, r: Recipe): Inventory {
  let out = inv;
  for (const [id, n] of Object.entries(r.needs)) out = add(out, id, n);
  return out;
}

export function design(r: Recipe, id: string): Design {
  const d = r.designs.find((x) => x.id === id);
  if (!d) throw new Error(`No design ${id} for ${r.id}`);
  return d;
}

/** The best design (the one that works); every recipe must have exactly one. */
export function bestDesign(r: Recipe): Design {
  const ok = r.designs.filter((d) => d.outcome === 'works');
  if (ok.length !== 1) throw new Error(`${r.id} needs exactly one design that works`);
  return ok[0];
}

/** A short list of what is missing, for a message ("2 scrap wood and 1 old fishing net"). */
export function missingText(m: Inventory, names: Record<string, string>): string {
  const parts = Object.entries(m).map(([id, n]) => `${n} ${(names[id] ?? id).toLowerCase()}`);
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}
