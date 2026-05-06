import React, { ReactNode } from 'react';
import { Icons } from '../Icons';

interface ReportSectionProps {
  title: string;
  visualComponent: ReactNode | null;
  interpretationText: string | any[] | null;
  isLoading: boolean;
  type?: 'text' | 'toons' | 'mixed';
  renderToons?: (data: any[]) => ReactNode;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, visualComponent, interpretationText, isLoading, type = 'text', renderToons }) => {
  return (
    <div className="mb-12 bg-white rounded-3xl p-8 shadow-sm border border-stone-100 relative overflow-hidden group hover:shadow-md transition-all">
      {/* Soft top border accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative corner mandala corner (faint) */}
      <div className="absolute -top-24 -right-24 w-64 h-64 text-amber-500 opacity-[0.03] pointer-events-none transform rotate-12">
         <Icons.MandalaBackground />
      </div>
      
      <div className="flex flex-col items-center mb-8 relative z-10 text-center">
         <div className="mb-3 text-stone-300">
           <Icons.OrnamentalDivider className="w-40" />
         </div>
         <h2 className="text-2xl font-serif text-charcoal-900 tracking-wide">{title}</h2>
      </div>

      {/* Synchronous Visual Component (Zero AI Tokens) */}
      {visualComponent && (
        <div className="mb-8 relative z-10">
          {visualComponent}
        </div>
      )}

      {/* AI Interpretation Block */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-stone-100 rounded w-3/4"></div>
            <div className="h-4 bg-stone-100 rounded w-full"></div>
            <div className="h-4 bg-stone-100 rounded w-5/6"></div>
            <div className="h-4 bg-stone-100 rounded w-1/2"></div>
            <div className="flex items-center gap-2 mt-6 justify-center">
                <div className="w-4 h-4 rounded-full border border-stone-200 border-t-gold-500 animate-spin"></div>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Interpreting Cosmos...</span>
            </div>
          </div>
        ) : interpretationText ? (
          <div className="text-stone-600 leading-[1.8] text-[15px] font-medium tracking-wide">
            {type === 'text' && typeof interpretationText === 'string' && (
              <p className="whitespace-pre-wrap">{interpretationText}</p>
            )}
            {type === 'toons' && Array.isArray(interpretationText) && renderToons && (
              renderToons(interpretationText)
            )}
            {type === 'mixed' && typeof interpretationText === 'string' && (
               <p className="whitespace-pre-wrap">{interpretationText}</p>
            )}
            {/* Fallback for when TOONS array comes back empty or bad parse */}
            {type === 'toons' && Array.isArray(interpretationText) && interpretationText.length === 0 && (
               <p className="text-stone-400 italic text-center">Interpretation temporarily unavailable. Please refresh.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReportSection;
