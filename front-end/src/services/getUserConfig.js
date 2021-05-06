export async function getUserConfig(user) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/get_user_config/', {headers: {Authorization: "Token " + user.token}});
    return await response.json();
}