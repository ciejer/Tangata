export async function getModel(modelNodeId) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/models/' + modelNodeId);
    return await response.json();
}