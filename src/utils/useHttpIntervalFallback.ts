/*
 * Copyright 2019-2020 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { useEffect, useState } from "react";

const useHttpIntervalFallback = (useFallback: boolean, fn: () => void) => {
    const [httpInterval, setHttpInterval] = useState<NodeJS.Timeout | undefined>();

    useEffect(() => {
        if (useFallback && !httpInterval) {
            setHttpInterval(setInterval(fn, 3000));
        } else if (!useFallback && httpInterval) {
            clearInterval(httpInterval);
            setHttpInterval(undefined);
        }
    }, [useFallback]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => httpInterval && clearInterval(httpInterval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useHttpIntervalFallback;
