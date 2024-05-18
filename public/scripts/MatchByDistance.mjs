import { distance } from 'fastest-levenshtein';

// noinspection DuplicatedCode
export default ({ definition1, definition2, relations, parentList, childList }) => {
    console.log(`Processing for: ${definition1.id} & ${definition2.id}`);
    try {
        const json1 = JSON.parse(definition1.json);
        const json2 = JSON.parse(definition2.json);

        const text1 = json1.data.description + json1.data.first_mes;
        const text2 = json2.data.description + json2.data.first_mes;

        const measurement = distance(text1, text2);
        const maxLength = Math.max(text1.length, text2.length);
        const normalizedDistance = measurement / maxLength;
        const similarity = 1 - normalizedDistance;

        if (similarity >= 0.9) {
            const newRelations = [];
            if (parentList.has(definition2.id)) {
                newRelations.push({ current_id: definition1.id, old_id: definition2.id });
                childList.add(definition2.id);

                relations
                    .filter((x) => x.current_id === definition2.id)
                    .forEach((x) => {
                        newRelations.push({ current_id: definition1.id, old_id: x.old_id });
                    });

                return { relations: newRelations, childId: definition2.id };
            }

            if (!childList.has(definition1.id)) {
                newRelations.push({ current_id: definition1.id, old_id: definition2.id });
                return { relations: newRelations };
            }
        }
    } catch {
        // Ignore
    }

    return undefined;
};
