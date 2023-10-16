// import XRegExp from "xregexp";


function findJsonObjects(message) {
    // const jsonObjects = XRegExp.matchRecursive(message, '\\{', '\\}', 'g', {unbalanced: 'skip'});
    //
    // //Add { at the beginning and } at the end
    // return jsonObjects.map((matchedString) => {
    //     return `{${matchedString}}`
    // })

    return  {};
}


export function analyzeMessage(message) {
    const str1 = 'domino effect { "notre":"dome", "kaka": { "user-input":"owino  " } } Wengi { watu }';

    const allJsonStringObjects = findJsonObjects(str1);
    const validJsonStringObjects = [];

    allJsonStringObjects.forEach((json)=>{
        console.log(json)
        try{
            validJsonStringObjects.push(JSON.parse(json))
        }catch (e){

        }
    });

    let results = {
        "objectsObjects": validJsonStringObjects,
        "arrays": []
    }
    console.log(JSON.stringify(results))

    return results;
}


