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
import React from "react";

import { OptGroupField } from "../src";
import createContext from "./_createContext";
import mount from "./_mount";

test("<OptGroupField> - renders an the correct fields when disabled", () => {
    const element = <OptGroupField name="x" />;
    const wrapper = mount(
        element,
        createContext({
            x: { type: Object },
            "x.enabled": { type: Boolean },
            "x.b": { type: Number },
            "x.c": { type: Number }
        })
    );

    expect(wrapper.find("input")).toHaveLength(1);
    expect(
        wrapper
            .find("input")
            .at(0)
            .prop("name")
    ).toBe("x.enabled");
});

test("<OptGroupField> - renders an the correct fields when enabled", () => {
    const element = <OptGroupField name="x" />;
    const wrapper = mount(
        element,
        createContext(
            {
                x: { type: Object },
                "x.enabled": { type: Boolean },
                "x.b": { type: Number },
                "x.c": { type: Number }
            },
            { model: { x: { enabled: true } } }
        )
    );

    expect(wrapper.find("input")).toHaveLength(3);
    expect(
        wrapper
            .find("input")
            .at(0)
            .prop("name")
    ).toBe("x.enabled");
    expect(
        wrapper
            .find("input")
            .at(1)
            .prop("name")
    ).toBe("x.b");
    expect(
        wrapper
            .find("input")
            .at(2)
            .prop("name")
    ).toBe("x.c");
});

test("<OptGroupField> - renders a label", () => {
    const element = <OptGroupField name="x" label="y" />;
    const wrapper = mount(
        element,
        createContext({
            x: { type: Object },
            "x.enabled": { type: Boolean },
            "x.b": { type: Number }
        })
    );

    expect(wrapper.find("label")).toHaveLength(3);
    expect(
        wrapper
            .find("label")
            .at(0)
            .text()
    ).toBe('[missing "en.forms.fields.x.title" translation][missing "en.forms.fields.x.info" translation]');
});

test("<OptGroupField> - renders a wrapper with unknown props", () => {
    const element = <OptGroupField name="x" data-x="x" data-y="y" data-z="z" />;
    const wrapper = mount(
        element,
        createContext({
            x: { type: Object },
            "x.enabled": { type: Boolean },
            "x.b": { type: Number }
        })
    );

    expect(
        wrapper
            .find("section")
            .at(0)
            .prop("data-x")
    ).toBe("x");
    expect(
        wrapper
            .find("section")
            .at(0)
            .prop("data-y")
    ).toBe("y");
    expect(
        wrapper
            .find("section")
            .at(0)
            .prop("data-z")
    ).toBe("z");
});
