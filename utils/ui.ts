export const getLogStyle = (type: string) => {
    switch (type) {
        case 'match': return 'border-yellow-500 text-yellow-200 bg-yellow-900/10';
        case 'ontology': return 'border-green-500 text-green-300 bg-green-900/10';
        case 'reuse': return 'border-blue-400 text-blue-300 bg-blue-900/10';
        default: return 'border-gray-500 text-gray-400 bg-gray-800/20';
    }
};
