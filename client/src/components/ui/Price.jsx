export default function Price({ price, discountPercent = 0, size = "md" }) {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price); // Price is already in COP

    const originalPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format((price) / (1 - discountPercent / 100));

    const sizeClasses = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-2xl",
        xl: "text-3xl"
    };

    return (
        <div className="flex items-baseline gap-2">
            <span className={`font-bold text-white group-hover:text-sc-cyan transition-colors ${sizeClasses[size]}`}>
                {formattedPrice}
            </span>
            {discountPercent > 0 && (
                <span className="text-slate-500 text-xs line-through">
                    {originalPrice}
                </span>
            )}
        </div>
    );
}
