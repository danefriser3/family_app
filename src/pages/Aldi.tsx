import { useQuery } from "@apollo/client/react";
import { GET_ALDI_CATEGORIES, GET_ALDI_PRODUCTS } from "../graphql/queries";
import { AldiCategory, AldiProduct } from "../types/graphql";
import { Card, CardContent, CardHeader, FormControl, InputLabel, Menu, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { a, b } from "vitest/dist/chunks/suite.d.FvehnV49.js";


export interface AldiProducts {
    aldiProducts: AldiProduct[];
}

const Aldi = () => {

    const { data } = useQuery<AldiProducts>(GET_ALDI_PRODUCTS);
    const { data: categoriesData } = useQuery<AldiCategory>(GET_ALDI_CATEGORIES);

    const [filteredProducts, setFilteredProducts] = useState<AldiProduct[]>(data?.aldiProducts || []);

    const [category, setCategory] = useState('tutti');

    const onChange = (category: string) => {
        if (category === 'tutti') {
            setFilteredProducts(data?.aldiProducts || []);
        } else {
            const filtered = data?.aldiProducts.filter(product => product.category === category) || [];
            setFilteredProducts(filtered);
        }
    };

    return <Card>
        <CardHeader title="Prodotti Aldi" />
        <CardContent>
            <Typography variant="h6" gutterBottom>Elenco Prodotti {data?.aldiProducts.length} </Typography>
            <Stack spacing={2}>
                <FormControl fullWidth >
                    <InputLabel id="demo-simple-select-label">Category</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={category}
                        label="Category"
                        onChange={(event) => { onChange(event.target.value); setCategory(event.target.value); }}
                    >
                        <MenuItem value={'tutti'}>Tutti</MenuItem>
                        {categoriesData?.aldiCategories.map((cat, index) => (
                            <MenuItem key={index} value={cat.category}>{cat.category}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Stack direction='column' gap={1}>{filteredProducts.map(product => (
                    <Card key={product.id}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row">

                                    <img src={product.image} alt={product.name} style={{ width: 125, height: 100, objectFit: 'contain' }} />
                                    <Stack>
                                        <Typography variant="subtitle1">{product.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{product.category}</Typography>
                                    </Stack>
                                </Stack>
                                <Typography variant="h6">{product.price} €</Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}</Stack>
            </Stack>
        </CardContent>
    </Card>;
}

export default Aldi;
