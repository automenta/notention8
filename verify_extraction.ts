
import { LocalAIProvider } from './services/ai/LocalProvider';
import { OntologyNode } from './types';

const mockOntology: OntologyNode[] = [
    {
        id: '1',
        label: 'Generic',
        attributes: {
            'budget': { type: 'number', operators: { real: ['is'], imaginary: ['less than', 'greater than'] } },
            'deadline': { type: 'date', operators: { real: ['is'], imaginary: ['is before'] } },
            'role': { type: 'string', operators: { real: ['is'], imaginary: ['contains'] } },
            'skill': { type: 'string', operators: { real: ['is'], imaginary: ['contains'] } }
        }
    }
];

const provider = new LocalAIProvider();

async function runTests() {
    const testCases = [
        {
            text: "I need a budget under 500",
            expected: "[budget:less than:500]" // inferred by regex
        },
        {
            text: "Deadline is next week",
            expected: "deadline:is:" // Check for dynamic date
        },
        {
            text: "I am looking for a React Developer",
            expected: "[role:contains:React Developer]"
        },
        {
            text: "Budget over 1000",
            expected: "[budget:greater than:1000]"
        },
        {
             text: "Price between 100 and 200",
             expected: "[price:between:100,200]"
        },
        {
            text: "skill contains Vue",
            expected: "[skill:contains:Vue]"
        }
    ];

    console.log("Running extraction tests...");
    let passed = 0;

    for (const test of testCases) {
        const results = await provider.alignToOntology(test.text, mockOntology);
        const resultStr = results.join(', ');

        let success = false;
        if (test.text.includes("next week")) {
             success = results.some(r => r.startsWith('[deadline:is:20'));
        } else {
             success = results.some(r => r.includes(test.expected) || (test.expected.startsWith('[') && r === test.expected));
        }

        if (success) {
            console.log(`[PASS] "${test.text}" -> ${resultStr}`);
            passed++;
        } else {
            console.log(`[FAIL] "${test.text}"`);
            console.log(`       Expected: ${test.expected}`);
            console.log(`       Got:      ${resultStr}`);
        }
    }

    if (passed === testCases.length) {
        console.log("All tests passed!");
    } else {
        console.log(`Passed ${passed}/${testCases.length}`);
        process.exit(1);
    }
}

runTests();
