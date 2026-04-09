const normalizeDate = (dateStr) => {
    if (!dateStr || dateStr === '') return null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return dateStr;
};

console.log('Testing Normalization:');
console.log('2026-4-9  ->', normalizeDate('2026-4-9'));
console.log('2026-04-9 ->', normalizeDate('2026-04-9'));
console.log('2026-4-09 ->', normalizeDate('2026-4-09'));
console.log('09/04/2026 ->', normalizeDate('09/04/2026'));

if (normalizeDate('2026-4-9') === '2026-04-09' && normalizeDate('09/04/2026') === '2026-04-09') {
    console.log('✅ Success: Normalization working as expected.');
} else {
    console.log('❌ Failure: Normalization failed.');
    process.exit(1);
}
