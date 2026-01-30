import { useQuery } from "@apollo/client/react";
import { GET_ALDI_PRODUCTS } from "../graphql/queries";
import { AldiProduct } from "../types/graphql";
import { Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";


export interface AldiProducts {
    aldiProducts: AldiProduct[];
}

const Aldi = () => {

    const { data } = useQuery<AldiProducts>(GET_ALDI_PRODUCTS);

    return <Card>
        <CardHeader title="Prodotti Aldi" />
        <CardContent>
            <Typography variant="h6" gutterBottom>Elenco Prodotti {data?.aldiProducts.length} </Typography>
            <Stack direction='column' gap={1}>{data?.aldiProducts.map(product => (
                <Card key={product.id}>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <div>{product.name}</div>
                            <div>€ {product.price.toFixed(2)}</div>
                        </Stack>
                    </CardContent>
                </Card>
            ))}</Stack>
        </CardContent>
    </Card>;
}

export default Aldi;
