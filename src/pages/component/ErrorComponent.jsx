export default function ErrorComponent({error}) {
    return (
        <div>
            Erreur : {JSON.stringify(error)}
        </div>
    );
}