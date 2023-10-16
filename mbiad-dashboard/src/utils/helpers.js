



export function isEmpty(value){

    if(value===null){
        return true;
    }

    if(value===undefined){
        return true;
    }

    if(value==='undefined'){
        return true;
    }

    if(value==='null'){
        return true;
    }

    return value === '';

}

export function isNotEmpty(value){

    return !isEmpty(value);

}
