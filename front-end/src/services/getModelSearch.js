export async function getModelSearch(searchString, user) {
    console.log(user);
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/model_search/' + searchString, {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}