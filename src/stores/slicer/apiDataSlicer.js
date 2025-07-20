import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ApiService from "../../services/api";

export const fetchApiData = createAsyncThunk('apiData/fetchApiData', async ({url , itemKey ,  params = {}}) => {
    const response = await ApiService.get(url, params)
    //console.log("itemKey", itemKey , "response", url , params)
    return {
        clef : itemKey,
        data : response.data
    }
})


const apiDataSlice = createSlice({
    name: 'apiData',
    initialState: {
        data: {},
        loading: false,
        error: null
    },
    reducers: {
       
    },
    extraReducers: (builder) => {
        builder.addCase(fetchApiData.pending, (state) => {
            state.loading = true
          
        })
        builder.addCase(fetchApiData.fulfilled, (state, action) => {
            state.loading = false
            state.data[action.payload.clef] = action.payload.data
            //console.log("CLEF",  action.payload)
        })
        builder.addCase(fetchApiData.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
        })
    }
})

//export const {  } = apiDataSlice.actions

export default apiDataSlice.reducer
