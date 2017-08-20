declare function require(arg: string): string;
/* tslint:disable:no-namespace interface-name*/
interface JWPlayer {
    getVisualQuality(): {
        bitrate: number;
        level: {
            width: number;
            height: number;
            index: number;
            label: number;
        };
        mode: string;
        reason: string;
    };
}
declare global {
    interface Window {
        jwplayer(): JWPlayer;
    }
}
/* tslint:enable:no-namespace interface-name*/

import * as $ from "jquery";
import {Intent} from "./common";

const redditLogo = chrome.extension.getURL("images/reddit-icon.png");
const malLogo = chrome.extension.getURL("images/mal-icon.png");
const kitsuLogo = chrome.extension.getURL("images/kitsu-icon.png");
const screenshotLogo = chrome.extension.getURL("images/screenshot.png");

// *** Animations ***
function showModal(selector: string): void {
    const modal = $(selector);
    $("body").css("overflow", "hidden");
    modal.show();
    modal.find(".container").addClass("fade_in");
    setTimeout(() => {
        modal.find(".container").removeClass("fade_in");
    }, 500);
}

function hideModal(selector: string): void {
    const modal = $(selector);
    $(modal).find(".container").addClass("fade_out");
    setTimeout(() => {
        $(modal).find(".container").removeClass("fade_out");
        $(modal).hide();
        $("body").css("overflow", "auto");
    }, 500);
}

/**
 * Returns a string template of the Utility Bar.
 * @param {string} animeName - Name of the current anime
 * @returns
 *      The Utility Bar
 */
export default function utilityBar(animeName: string): JQuery<HTMLElement> {
    const template = require("html-loader!../templates/utilityBar.html");
    const bar = $(template);

    // 1> Attach the screenshot modal
    $("body").append(
        `<div class="nac__modal" id="nac__screenshot-modal" style="display: none;">
            <div class="container">
                <div class="header">
                    Right click on the image and select Save image as/Copy image
                </div>
                <div class="body">
                    <canvas id="nac__screenshot"></canvas>
                </div>
                <div class="footer">
                    <span id="nac__screenshot__info"></span>
                </div>
            </div>
        </div>`,
    );
    // 2> When the overlay is clicked, the modal hides
    $("#nac__screenshot-modal").on("click", e => {
        if (e.target === $("#nac__screenshot-modal")[0]) {
            hideModal("#nac__screenshot-modal");
        }
    });

    const reddit = bar.find("#nac__utility-bar__reddit");
    const mal = bar.find("#nac__utility-bar__mal");
    const kitsu = bar.find("#nac__utility-bar__kitsu");
    const screenshot = bar.find("#nac__utility-bar__screenshot");

    // Add icons
    reddit.find("img").attr("src", redditLogo);
    mal.find("img").attr("src", malLogo);
    kitsu.find("img").attr("src", kitsuLogo);
    screenshot.find("img").attr("src", screenshotLogo);

    // Attach functionality
    reddit.on("click", () => {
        const episode = $("#servers").find(".episodes > li > a.active").data("base");
        chrome.runtime.sendMessage({
            episode,
            intent: Intent.Reddit_Discussion,
            animeName,
        });
    });
    mal.on("click", () => {
        chrome.runtime.sendMessage({
            intent: Intent.Find_In_Mal,
            animeName,
        });
    });
    kitsu.on("click", () => {
        chrome.runtime.sendMessage({
            intent: Intent.Find_In_Kitsu,
            animeName,
        });
    });
    screenshot.on("click", () => {
        const video = $(".jw-video");
        const canvas: HTMLCanvasElement = $("#nac__screenshot")[0] as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (ctx && video[0]) {
            // The way videoHeight & videoWidth works is that they are set
            // on the video's onloadedmetadata event. Since we cant really
            // attach a listener for that since as jwplayer generates the
            // video tag on the fly, we will have to assume that they are
            // already set.
            canvas.height = (video[0] as HTMLVideoElement).videoHeight;
            canvas.width = (video[0] as HTMLVideoElement).videoWidth;
            ctx.drawImage(video[0] as HTMLVideoElement, 0, 0, canvas.width, canvas.height);

            $("#nac__screenshot__info").text(`Resolution: ${canvas.width}px x ${canvas.height}px`);
            showModal("#nac__screenshot-modal");
        }
    });
    return bar;
}
