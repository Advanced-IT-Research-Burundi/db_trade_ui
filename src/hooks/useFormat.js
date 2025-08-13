

export default function useFormat() {
    const formatNumber = (number) => {
        if (!number) return '0';
        return new Intl.NumberFormat('fr-BI', { maximumFractionDigits: 2 }).format(number);
    }
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
      };
    
    return { formatNumber, formatDate };
}
