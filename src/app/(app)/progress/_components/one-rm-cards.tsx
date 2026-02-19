interface OneRmCardsProps {
  e1rm: number;
  bestVolume: number;
}

export function OneRmCards({ e1rm, bestVolume }: OneRmCardsProps) {
  return (
    <div className="mb-2.5 flex gap-2.5">
      <div className="flex-1 rounded-lg border border-border bg-secondary p-2.5 text-center">
        <div className="text-xl font-bold text-[#a29bfe]">{e1rm}</div>
        <div className="mt-0.5 text-[10px] uppercase text-muted-foreground">
          Est. 1RM (kg)
        </div>
      </div>
      <div className="flex-1 rounded-lg border border-border bg-secondary p-2.5 text-center">
        <div className="text-xl font-bold text-[#a29bfe]">
          {bestVolume.toLocaleString()}
        </div>
        <div className="mt-0.5 text-[10px] uppercase text-muted-foreground">
          Best Volume
        </div>
      </div>
    </div>
  );
}
