export async function getSSH(user) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/get_ssh', {headers: {Authorization: "Token " + user.token}});
    return await response;
}