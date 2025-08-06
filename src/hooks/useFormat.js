

export default function useFormat() {
    const formatNumber = (number) => {
        return new Intl.NumberFormat('fr-BI', { maximumFractionDigits: 2 }).format(number);
    }
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
      };
    
    return { formatNumber, formatDate };
}
