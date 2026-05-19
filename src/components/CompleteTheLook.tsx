
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { products } from '@/lib/store';
import { aiStylingAssistant, AiStylingAssistantOutput } from '@/ai/flows/ai-styling-assistant-flow';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

interface CompleteTheLookProps {
  mainProduct: Product;
}

export default function CompleteTheLook({ mainProduct }: CompleteTheLookProps) {
  const [stylingAdvice, setStylingAdvice] = useState<AiStylingAssistantOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const complementaryProducts = useMemo(() => {
    return products.filter(p => mainProduct.suggestions_ids.includes(p.id));
  }, [mainProduct.suggestions_ids]);

  useEffect(() => {
    async function getAdvice() {
      try {
        const result = await aiStylingAssistant({
          mainProduct: {
            name: mainProduct.name,
            description: mainProduct.description,
            category: mainProduct.category,
            imageURL: mainProduct.imageUrl
          },
          suggestedProducts: complementaryProducts.map(p => ({
            name: p.name,
            description: p.description,
            category: p.category,
            imageURL: p.imageUrl
          }))
        });
        setStylingAdvice(result);
      } catch (error) {
        console.error("Failed to fetch styling advice", error);
      } finally {
        setLoading(false);
      }
    }
    getAdvice();
  }, [mainProduct, complementaryProducts]);

  return (
    <section className="mt-20 border-t pt-20">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-headline">Complete the Look</h2>
          <p className="text-sm text-muted-foreground">Expert styling suggestions for your selected piece.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {complementaryProducts.map((p) => (
              <div key={p.id} className="group relative">
                <Link href={`/products/${p.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border bg-muted">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium">{p.name}</h4>
                    <p className="text-sm font-bold text-primary">${p.price.toLocaleString('es-CO')}</p>
                  </div>
                </Link>
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(p);
                    toast({
                      title: "Added",
                      description: `${p.name} added to bag.`
                    });
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Card className="h-full bg-muted/30 border-none">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                AI Stylist Insights
              </h3>
              
              {loading ? (
                <div className="flex h-40 flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Crafting your perfect outfit tips...</p>
                </div>
              ) : stylingAdvice ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Styling Tips</h4>
                    <p className="text-sm leading-relaxed text-foreground/80">{stylingAdvice.stylingTips}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Best For</h4>
                    <p className="text-sm leading-relaxed text-foreground/80">{stylingAdvice.occasions}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Styling advice currently unavailable. Try refreshing.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
