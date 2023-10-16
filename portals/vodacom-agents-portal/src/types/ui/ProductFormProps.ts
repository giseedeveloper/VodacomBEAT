
interface Values {
    title: string;
    description: string;
    modifier: string;
}


interface ProductFormProps {
    open: boolean;
    onSubmit: (values: Values) => void;
    onCancel: () => void;
}

export default ProductFormProps
