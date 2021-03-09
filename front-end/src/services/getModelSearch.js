export async function getModelSearch(searchString) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/model_search/' + searchString);
    return await response.json();
}