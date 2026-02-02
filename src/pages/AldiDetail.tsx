import { useQuery } from "@apollo/client/react";
import { GET_ALDI_PRODUCT_BY_SKU } from "../graphql/queries";
import { AldiProduct } from "../types/graphql";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBack from "@mui/icons-material/ArrowBack";

interface AldiProductExtended extends AldiProduct {
    description: string;
}

interface AldiProductData {
    aldiProduct: AldiProductExtended;
}

const AldiDetail = () => {
    const sku = window.location.pathname.split('/')[2];
    const { data, loading } = useQuery<AldiProductData>(GET_ALDI_PRODUCT_BY_SKU, {
        variables: { sku }
    });

    if (loading) {
        return <Card><CardContent><Typography>Caricamento...</Typography></CardContent></Card>;
    }

    const product = data?.aldiProduct;

    if (!product) {
        return <Card>
            <CardContent>
                <Typography>Prodotto non trovato</Typography>
                <Button onClick={() => window.location.href = '/aldi'} startIcon={<ArrowBack />}>
                    Torna alla lista
                </Button>
            </CardContent>
        </Card>;
    }

    return <Card>
        <CardHeader
            title={product.name}
            action={
                <Button onClick={() => window.location.href = '/aldi'} startIcon={<ArrowBack />}>
                    Indietro
                </Button>
            }
        />
        <CardContent>
            <Stack spacing={3}>
                {product.image && (
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', maxWidth: 400, height: 'auto', objectFit: 'contain' }}
                    />
                )}
                <Stack spacing={1}>
                    <Typography variant="h6">Dettagli Prodotto</Typography>
                    <Typography><strong>SKU:</strong> {product.sku}</Typography>
                    <Typography><strong>Categoria:</strong> {product.category}</Typography>
                    <Typography><strong>Prezzo:</strong> €{product.price.toFixed(2)}</Typography>
                    {product.description && (
                        <div>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}><strong>Descrizione:</strong></Typography>
                            <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>
                    )}
                </Stack>
            </Stack>
        </CardContent>
    </Card>;
}

export default AldiDetail;
